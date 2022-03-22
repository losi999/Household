import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Transaction } from '@household/shared/types/types';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  getTransactionById(transactionId: Transaction.IdType): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: {
    transactionId: Transaction.IdType;
    accountId: Account.IdType;
  }): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.IdType): Promise<unknown>;
  updateTransaction(doc: Transaction.Document): Promise<unknown>;
  listTransactions(isAscending?: boolean): Promise<Transaction.Document[]>;
  listTransactionsByAccountId(data: {
    accountId: Account.IdType;
    pageSize: number;
    pageNumber: number;
  }): Promise<Transaction.Document[]>;
}

export const transactionServiceFactory = (mongodbService: IMongodbService): ITransactionService => {

  const instance: ITransactionService = {
    dumpTransactions: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.find({}, null, {
          session, 
        }).lean()
          .exec();
      });
    },
    saveTransaction: (doc) => {
      return mongodbService.transactions.create(doc);
    },
    getTransactionById: async (transactionId) => {
      return !transactionId ? undefined : mongodbService.transactions.findById(transactionId)
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
      }).populate('project')
        .populate('recipient')
        .populate('account')
        .populate('category')
        .populate('transferAccount')
        .populate('splits.category')
        .populate('splits.project')
        .lean()
        .exec();
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.transactions.deleteOne({
        _id: transactionId, 
      }).exec();
    },
    updateTransaction: (doc) => {
      return mongodbService.transactions.replaceOne({
        _id: doc._id, 
      }, doc, {
        runValidators: true, 
      }).exec();
    },
    listTransactions: (isAscending = true) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.find({}, null, {
          session, 
        })
          .sort({
            issuedAt: isAscending ? 'asc' : 'desc',
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
          .populate('transferAccount')
          .populate('splits.category')
          .populate('splits.project')
          .lean()
          .exec();
      });
    },
  };

  return instance;
};
