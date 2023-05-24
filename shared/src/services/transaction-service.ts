import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Common, Transaction, Recipient, Project, Category } from '@household/shared/types/types';
import { FilterQuery } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  getTransactionById(transactionId: Transaction.IdType): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.Id & Account.Id): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.IdType): Promise<unknown>;
  updateTransaction(doc: Transaction.Document): Promise<unknown>;
  listTransactions(query: {
    accounts: Account.IdType[];
    categories: Category.IdType[];
    projects: Project.IdType[];
    recipients: Recipient.IdType[];
    issuedAtFrom: string;
    issuedAtTo: string;
  }): Promise<(Transaction.PaymentDocument | Transaction.SplitDocument)[]>;
  listTransactionsByAccountId(data: Account.Id & Common.Pagination<number>): Promise<Transaction.Document[]>;
}

export const transactionServiceFactory = (mongodbService: IMongodbService): ITransactionService => {

  const instance: ITransactionService = {
    dumpTransactions: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions().find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveTransaction: (doc) => {
      return mongodbService.transactions().create(doc);
    },
    getTransactionById: async (transactionId) => {
      return !transactionId ? undefined : mongodbService.transactions().findById(transactionId)
        .populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('inventory.product')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project')
        .populate('splits.inventory.product')
        .lean()
        .exec();
    },
    getTransactionByIdAndAccountId: async ({ transactionId, accountId }) => {
      return !transactionId ? undefined : mongodbService.transactions().findOne({
        _id: transactionId,
        $or: [
          {
            account: accountId,
          },
          {
            transferAccount: accountId,
          },
        ],
      })
        .populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('inventory.product')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project')
        .populate('splits.inventory.product')
        .lean()
        .exec();
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.transactions().deleteOne({
        _id: transactionId,
      })
        .exec();
    },
    updateTransaction: (doc) => {
      return mongodbService.transactions().replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
    },
    listTransactions: ({ accounts, categories, projects, recipients, issuedAtFrom, issuedAtTo }) => {
      return mongodbService.inSession((session) => {
        const query: FilterQuery<Transaction.Document> = {
          transactionType: {
            $not: {
              $eq: 'transfer',
            },
          },
          issuedAt: {
            $lte: new Date(),
          },
          $and: [],
        };

        if (issuedAtFrom) {
          query.issuedAt.$gte = new Date(issuedAtFrom);
        }

        if (issuedAtTo) {
          query.issuedAt.$lte = new Date(issuedAtTo);
        }

        if (accounts) {
          query.$and.push({
            account: {
              $in: accounts,
            },
          });
        }

        if (categories) {
          query.$and.push({
            $or: [
              {
                'splits.category': {
                  $in: categories,
                },
              },
              {
                category: {
                  $in: categories,
                },
              },
            ],
          });
        }

        if (projects) {
          query.$and.push({
            $or: [
              {
                'splits.project': {
                  $in: projects,
                },
              },
              {
                project: {
                  $in: projects,
                },
              },
            ],
          });
        }

        if (recipients) {
          query.$and.push({
            recipient: {
              $in: recipients,
            },
          });
        }

        if (query.$and.length === 0) {
          delete query.$and;
        }

        return mongodbService.transactions().find(query, null, {
          session,
        })
          // .sort({
          //   amount: 'asc',
          // })
          .populate('project')
          .populate('recipient')
          .populate('account')
          .populate('category')
          .populate('splits.category')
          .populate('splits.project')
          .lean<(Transaction.PaymentDocument | Transaction.SplitDocument)[]>()
          .exec();
      });
    },
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions().find({
          $or: [
            {
              account: accountId,
            },
            {
              transferAccount: accountId,
            },
          ],
        }, null, {
          session,
        })
          .sort({
            issuedAt: 'desc',
          })
          .limit(pageSize)
          .skip((pageNumber - 1) * pageSize)
          .populate('project')
          .populate('recipient')
          .populate('account')
          .populate('category')
          .populate('inventory.product')
          .populate('transferAccount')
          .populate('splits.category')
          .populate('splits.project')
          .populate('splits.inventory.product')
          .lean()
          .exec();
      });
    },
  };

  return instance;
};
