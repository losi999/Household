import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Aggregate, ClientSession, Types } from 'mongoose';

export interface IDatabaseService {
  dumpProjects(): Promise<Project.Document[]>;
  dumpAccounts(): Promise<Account.Document[]>;
  dumpRecipients(): Promise<Recipient.Document[]>;
  dumpCategories(): Promise<Category.Document[]>;
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveProject(doc: Project.Document): Promise<Project.Document>;
  saveRecipient(doc: Recipient.Document): Promise<Recipient.Document>;
  saveAccount(doc: Account.Document): Promise<Account.Document>;
  saveCategory(doc: Category.Document): Promise<Category.Document>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransferTransaction(docs: [Transaction.TransferDocument, Transaction.TransferDocument]): Promise<Transaction.Document[]>;
  getProjectById(projectId: Project.IdType): Promise<Project.Document>;
  getRecipientById(recipientId: Recipient.IdType): Promise<Recipient.Document>;
  getAccountById(accountId: Account.IdType): Promise<Account.Document>;
  getCategoryById(categoryId: Category.IdType): Promise<Category.Document>;
  getTransactionById(transactionId: Transaction.IdType): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: {
    transactionId: Transaction.IdType;
    accountId: Account.IdType;
  }): Promise<Transaction.Document>;
  deleteProject(projectId: Project.IdType): Promise<unknown>;
  deleteRecipient(recipientId: Recipient.IdType): Promise<unknown>;
  deleteAccount(accountId: Account.IdType): Promise<unknown>;
  deleteCategory(categoryId: Category.IdType): Promise<unknown>;
  deleteTransaction(transactionId: Transaction.IdType): Promise<unknown>;
  updateProject(doc: Project.Document): Promise<unknown>;
  updateRecipient(doc: Recipient.Document): Promise<unknown>;
  updateAccount(doc: Account.Document): Promise<unknown>;
  updateCategory(doc: Category.Document, oldFullName: string): Promise<unknown>;
  updateTransaction(doc: Transaction.Document): Promise<unknown>;
  listProjects(): Promise<Project.Document[]>;
  listRecipients(): Promise<Recipient.Document[]>;
  listAccounts(): Promise<Account.Document[]>;
  listCategories(): Promise<Category.Document[]>;
  listTransactions(isAscending?: boolean): Promise<Transaction.Document[]>;
  listTransactionsByAccountId(data: {
    accountId: Account.IdType;
    pageSize: number;
    pageNumber: number;
  }): Promise<Transaction.Document[]>;
  listProjectsByIds(projectIds: Project.IdType[]): Promise<Project.Document[]>;
  listAccountsByIds(accountIds: Account.IdType[]): Promise<Account.Document[]>;
  listCategoriesByIds(categoryIds: Category.IdType[]): Promise<Category.Document[]>;
}

export const databaseServiceFactory = (mongodbService: IMongodbService): IDatabaseService => {

  const updateCategoryFullName = (oldName: string, newName: string, session: ClientSession): Promise<unknown> => {
    return mongodbService.categories.updateMany({
      fullName: {
        $regex: `^${oldName}:`
      }
    }, [{
      $set: {
        fullName: {
          $replaceOne: {
            input: '$fullName',
            find: `${oldName}:`,
            replacement: `${newName}:`,
          }
        }
      }
    }], {
      runValidators: true,
      session
    }).exec();
  };

  const aggregateAccountBalance = (aggregate: Aggregate<any[]>): Aggregate<any[]> => {
    return aggregate.lookup({
      from: 'transactions',
      localField: '_id',
      foreignField: 'account',
      as: 'in'
    })
      .lookup({
        from: 'transactions',
        localField: '_id',
        foreignField: 'transferAccount',
        as: 'out'
      })
      .addFields({
        balance: {
          $subtract: [
            {
              $sum: '$in.amount'
            },
            {
              $sum: '$out.amount'
            }
          ]
        }
      })
      .project({
        in: false,
        out: false
      })
  };

  const instance: IDatabaseService = {
    dumpAccounts: () => {
      return mongodbService.accounts.find().lean().exec();
    },
    dumpProjects: () => {
      return mongodbService.projects.find().lean().exec();
    },
    dumpRecipients: () => {
      return mongodbService.recipients.find().lean().exec();
    },
    dumpCategories: () => {
      return mongodbService.categories.find().lean().exec();
    },
    dumpTransactions: () => {
      return mongodbService.transactions.find().lean().exec();
    },
    saveProject: (doc) => {
      return mongodbService.projects.create(doc);
    },
    saveRecipient: (doc) => {
      return mongodbService.recipients.create(doc);
    },
    saveAccount: (doc) => {
      return mongodbService.accounts.create(doc);
    },
    saveCategory: (doc) => {
      return mongodbService.categories.create(doc);
    },
    saveTransaction: (doc) => {
      return mongodbService.transactions.create(doc);
    },
    saveTransferTransaction: (docs) => {
      return mongodbService.transactions.insertMany(docs);
    },
    getProjectById: async (projectId) => {
      return !projectId ? undefined : mongodbService.projects.findById(projectId).lean().exec();
    },
    getRecipientById: async (recipientId) => {
      return !recipientId ? undefined : mongodbService.recipients.findById(recipientId).lean().exec();
    },
    getAccountById: async (accountId) => {
      const [account] = await aggregateAccountBalance(mongodbService.accounts.aggregate().match({
        _id: new Types.ObjectId(accountId)
      })).exec();

      return !accountId ? undefined : account;
    },
    getCategoryById: async (categoryId) => {
      return !categoryId ? undefined : mongodbService.categories.findById(categoryId).lean().exec();
    },
    getTransactionById: async (transactionId) => {
      return !transactionId ? undefined : mongodbService.transactions.findById(transactionId)
        .populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project').lean().exec();
    },
    getTransactionByIdAndAccountId: async ({ transactionId, accountId }) => {
      return !transactionId ? undefined : mongodbService.transactions.findOne({
        _id: transactionId,
        $or: [
          {
            account: accountId,
          },
          {
            transferAccount: accountId,
          }
        ]
      }).populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project').lean().exec();
    },
    deleteProject: async (projectId) => {
      const session = await mongodbService.startSession();
      return session.withTransaction(async () => {
        await mongodbService.projects.deleteOne({ _id: projectId }, { session }).exec();
        await mongodbService.transactions.updateMany({ project: projectId }, {
          $unset: {
            project: 1
          }
        }, {
          runValidators: true,
          session
        }).exec();
        await mongodbService.transactions.updateMany({
          'splits.project': projectId
        }, {

          $unset: {
            'splits.$[element].project': 1
          }
        }, {
          session,
          runValidators: true,
          arrayFilters: [{
            'element.project': projectId
          }]
        }).exec();
      })
    },
    deleteRecipient: async (recipientId) => {
      const session = await mongodbService.startSession();
      return session.withTransaction(async () => {
        await mongodbService.recipients.deleteOne({ _id: recipientId }, { session }).exec();
        await mongodbService.transactions.updateMany({ recipient: recipientId }, {
          $unset: {
            recipient: 1
          }
        }, { session }).exec();
      })
    },
    deleteAccount: async (accountId) => {
      const session = await mongodbService.startSession();
      return session.withTransaction(async () => {
        await mongodbService.accounts.deleteOne({ _id: accountId }, { session }).exec();
        await mongodbService.transactions.deleteMany({
          $or: [{
            account: accountId
          }, {
            transferAccount: accountId
          }]
        }, { session }).exec();
      });
    },
    deleteCategory: async (categoryId) => {
      const session = await mongodbService.startSession();
      return session.withTransaction(async () => {
        const deleted = await mongodbService.categories.findOneAndDelete({ _id: categoryId }, { session }).exec();

        await mongodbService.categories.updateMany({ parentCategory: deleted },
          deleted.parentCategory ? {
            $set: {
              parentCategory: deleted.parentCategory
            }
          } : {
            $unset: {
              parentCategory: 1
            }
          }, {
          runValidators: true,
          session
        }).exec();
        // await updateCategoryFullName(deleted.fullName, deleted.fullName.replace(new RegExp(`${deleted.name}$`), ''), session);
        await mongodbService.categories.updateMany({
          fullName: {
            $regex: `^${deleted.fullName}`
          }
        }, [{
          $set: {
            fullName: {
              $replaceOne: {
                input: '$fullName',
                find: `${deleted.fullName}:`,
                replacement: deleted.fullName.replace(new RegExp(`${deleted.name}$`), ''),
              }
            }
          }
        }], {
          runValidators: true,
          session
        }).exec();
        await mongodbService.transactions.updateMany({
          category: deleted
        }, deleted.parentCategory ? {
          $set: {
            category: deleted.parentCategory
          }
        } : {
          $unset: {
            category: 1
          }
        }, {
          runValidators: true,
          session
        }).exec();
        await mongodbService.transactions.updateMany({
          'splits.category': categoryId
        }, deleted.parentCategory ? {
          $set: {
            'splits.$[element].category': deleted.parentCategory,
          }
        } : {
          $unset: {
            'splits.$[element].category': 1
          }
        }, {
          session,
          runValidators: true,
          arrayFilters: [{
            'element.category': categoryId
          }]
        }).exec();
      });
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.transactions.deleteOne({ _id: transactionId }).exec();
    },
    updateProject: (doc) => {
      return mongodbService.projects.replaceOne({ _id: doc._id }, doc, { runValidators: true }).exec();
    },
    updateRecipient: (doc) => {
      return mongodbService.recipients.replaceOne({ _id: doc._id }, doc, { runValidators: true }).exec();
    },
    updateAccount: (doc) => {
      return mongodbService.accounts.replaceOne({ _id: doc._id }, doc, { runValidators: true }).exec();
    },
    updateCategory: async (doc, oldFullName) => {
      const session = await mongodbService.startSession();
      return session.withTransaction(async () => {
        await mongodbService.categories.replaceOne({ _id: doc._id }, doc, {
          runValidators: true,
          session
        }).exec();
        await updateCategoryFullName(oldFullName, doc.fullName, session);
      });
    },
    updateTransaction: (doc) => {
      return mongodbService.transactions.replaceOne({ _id: doc._id }, doc, { runValidators: true }).exec();
    },
    listProjects: () => {
      return mongodbService.projects.find()
        .collation({ locale: 'hu' })
        .sort('name')
        .lean()
        .exec();
    },
    listRecipients: () => {
      return mongodbService.recipients.find()
        .collation({ locale: 'hu' })
        .sort('name')
        .lean().exec();
    },
    listAccounts: () => {
      return aggregateAccountBalance(mongodbService.accounts.aggregate())
        .collation({ locale: 'hu' })
        .sort({
          name: 1
        }).exec();
    },
    listCategories: () => {
      return mongodbService.categories.find()
        .collation({ locale: 'hu' })
        .populate('parentCategory')
        .sort('fullName')
        .lean()
        .exec();
    },
    listTransactions: (isAscending = true) => {
      return mongodbService.transactions.find()
        .sort({
          issuedAt: isAscending ? 'asc' : 'desc'
        })
        .populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project')
        .lean()
        .exec();
    },
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.transactions.find({
        $or: [{
          account: accountId,
        },
        {
          transferAccount: accountId,
        }]
      })
        .sort({
          issuedAt: 'desc'
        })
        .limit(pageSize)
        .skip((pageNumber - 1) * pageSize)
        .populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project')
        .lean()
        .exec();
    },
    listProjectsByIds: async (projectIds) => {
      return mongodbService.projects.find({ _id: { $in: projectIds } }).lean().exec();
    },
    listAccountsByIds: async (accountIds) => {
      return mongodbService.accounts.find({ _id: { $in: accountIds } }).lean().exec();
    },
    listCategoriesByIds: async (categoryIds) => {
      return mongodbService.categories.find({ _id: { $in: categoryIds } }).lean().exec();
    },
  };

  return instance;
}