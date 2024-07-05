import { populate } from '@household/shared/common/utils';
import { getTransactionByIdAndAccountId } from '@household/shared/services/aggregates/get transaction by id and account id';
import { listDeferredTransactions } from '@household/shared/services/aggregates/list deferred transactions by account id';
import { listTransactionsByAccountId } from '@household/shared/services/aggregates/list transactions by account id';
import { transactionsReport } from '@household/shared/services/aggregates/transactions report';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Restrict } from '@household/shared/types/common';
import { Account, Common, Transaction } from '@household/shared/types/types';
import { PipelineStage, Types, UpdateQuery } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransactions(docs: Transaction.Document[]): Promise<any>;
  getTransactionById(transactionId: Transaction.Id): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.TransactionId & Account.AccountId): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.Id): Promise<unknown>;
  updateTransaction(transactionId: Transaction.Id, updateQuery: UpdateQuery<Transaction.Document>): Promise<unknown>;
  replaceTransaction(transactionId: Transaction.Id, doc: Restrict<Transaction.Document, '_id'>): Promise<unknown>;
  listTransactions(match: PipelineStage.Match): Promise<Transaction.ReportDocument[]>;
  listDeferredTransactions(ctx: {
    payingAccountIds?: Account.Id[];
    deferredTransactionIds?: Transaction.Id[];
    excludedTransferTransactionId?: Transaction.Id
  }): Promise<Transaction.DeferredDocument[]>;
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
        return session.withTransaction(() => {
          return mongodbService.transactions.insertMany(docs, {
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
            'transferAccount',
            'payingAccount',
            'ownerAccount',
            'category',
            'product',
            'splits.category',
            'splits.project',
            'splits.product',
            'deferredSplits.payingAccount',
            'deferredSplits.ownerAccount',
            'deferredSplits.category',
            'deferredSplits.project',
            'deferredSplits.product',
            'payments.transaction'),
          lean: true,
        })
        .exec();
    },
    getTransactionByIdAndAccountId: async ({ transactionId, accountId }) => {
      return !transactionId ? undefined : (await mongodbService.transactions.aggregate<Transaction.Document>(
        getTransactionByIdAndAccountId(transactionId, accountId),
      ))[0];
    },
    deleteTransaction: (transactionId) => {
      return mongodbService.transactions.deleteOne({
        _id: transactionId,
      })
        .exec();
    },
    updateTransaction: async (transactionId, updateQuery) => {
      return mongodbService.transactions.findOneAndUpdate({
        _id: new Types.ObjectId(transactionId),
        transactionType: updateQuery.$set.transactionType,
      }, updateQuery, {
        runValidators: true,
      });
    },
    replaceTransaction: (transactionId, doc) => {
      return mongodbService.transactions.findOneAndReplace({
        _id: new Types.ObjectId(transactionId),
      }, doc, {
        runValidators: true,
        overwriteDiscriminatorKey: true,
      })
        .exec();
    },
    listTransactions: (match) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.aggregate(transactionsReport(match), {
          session,
        });

      });
    },
    listDeferredTransactions: ({ payingAccountIds, deferredTransactionIds, excludedTransferTransactionId }) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.aggregate<Transaction.DeferredDocument>(
          listDeferredTransactions({
            payingAccountIds,
            excludedTransferTransactionId,
            deferredTransactionIds,
          }), {
            session,
          });
      });
    },
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.inSession(async (session) => {
        return mongodbService.transactions.aggregate([
          ...listTransactionsByAccountId(accountId),
          {
            $skip: (pageNumber - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
        ], {
          session,
        });
      });
    },
  };

  return instance;
};
