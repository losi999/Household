import { populate } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Common, Transaction, Recipient, Project, Category, Product } from '@household/shared/types/types';
import { FilterQuery } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransactions(docs: Transaction.Document[]): Promise<any>;
  getTransactionById(transactionId: Transaction.Id): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.TransactionId & Account.AccountId): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.Id): Promise<unknown>;
  updateTransaction(doc: Transaction.Document): Promise<unknown>;
  listTransactions(query: {
    accountIds: Account.Id[];
    categoryIds: Category.Id[];
    projectIds: Project.Id[];
    recipientIds: Recipient.Id[];
    productIds: Product.Id[];
    issuedAtFrom: string;
    issuedAtTo: string;
  }): Promise<(Transaction.PaymentDocument | Transaction.SplitDocument)[]>;
  listTransactionsByAccountId(data: Account.AccountId & Common.Pagination<number>): Promise<Transaction.Document[]>;
}

export const transactionServiceFactory = (mongodbService: IMongodbService): ITransactionService => {

  const instance: ITransactionService = {
    dumpTransactions: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.find({})
          .setOptions({
            session,
            lean: true,
          })
          .exec();
      });
    },
    saveTransaction: (doc) => {
      return mongodbService.transactions.create(doc);
    },
    saveTransactions: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.transactions.insertMany(docs, {
            session,
          });
        });
      });
    },
    getTransactionById: (transactionId) => {
      return !transactionId ? undefined : mongodbService.transactions.findById(transactionId)
        .setOptions({
          populate: populate('project',
            'recipient',
            'account',
            'category',
            'product',
            'transferAccount',
            'splits.category',
            'splits.project',
            'splits.product'),
          lean: true,
        })
        .exec();
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
          },
        ],
      })
        .setOptions({
          populate: populate('project',
            'recipient',
            'account',
            'category',
            'product',
            'transferAccount',
            'splits.category',
            'splits.project',
            'splits.product'),
          lean: true,
        })
        .exec();
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.transactions.deleteOne({
        _id: transactionId,
      })
        .exec();
    },
    updateTransaction: (doc) => {
      return mongodbService.transactions.replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
    },
    listTransactions: ({ accountIds, categoryIds, projectIds, recipientIds, productIds, issuedAtFrom, issuedAtTo }) => {
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

        if (accountIds) {
          query.$and.push({
            account: {
              $in: accountIds,
            },
          });
        }

        if (categoryIds) {
          query.$and.push({
            $or: [
              {
                'splits.category': {
                  $in: categoryIds,
                },
              },
              {
                category: {
                  $in: categoryIds,
                },
              },
            ],
          });
        }

        if (projectIds) {
          query.$and.push({
            $or: [
              {
                'splits.project': {
                  $in: projectIds,
                },
              },
              {
                project: {
                  $in: projectIds,
                },
              },
            ],
          });
        }

        if (productIds) {
          query.$and.push({
            $or: [
              {
                'splits.product': {
                  $in: productIds,
                },
              },
              {
                product: {
                  $in: productIds,
                },
              },
            ],
          });
        }

        if (recipientIds) {
          query.$and.push({
            recipient: {
              $in: recipientIds,
            },
          });
        }

        if (query.$and.length === 0) {
          delete query.$and;
        }

        return mongodbService.transactions.find<Transaction.PaymentDocument | Transaction.SplitDocument>(query)
          .setOptions({
            session,
            populate: populate('project',
              'recipient',
              'account',
              'category',
              'product',
              'transferAccount',
              'splits.category',
              'splits.project',
              'splits.product'),
            lean: true,
            sort: {
              issuedAt: 'asc',
            },
          })
          .exec();
      });
    },
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.find({
          $or: [
            {
              account: accountId,
            },
            {
              transferAccount: accountId,
            },
          ],
        })
          .setOptions({
            session,
            populate: populate('project',
              'recipient',
              'account',
              'category',
              'product',
              'transferAccount',
              'splits.category',
              'splits.project',
              'splits.product'),
            lean: true,
            sort: {
              issuedAt: 'desc',
            },
            limit: pageSize,
            skip: (pageNumber - 1) * pageSize,
          })
          .exec();
      });
    },
  };

  return instance;
};
