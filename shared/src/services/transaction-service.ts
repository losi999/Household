import { populate } from '@household/shared/common/utils';
import { listDeferredTransactions } from '@household/shared/services/aggregates/list deferred transactions by account id';
import { listTransactionsByAccountId } from '@household/shared/services/aggregates/list transactions by account id';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Common, Internal, Transaction } from '@household/shared/types/types';
import { PipelineStage, Types } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransactions(docs: Transaction.Document[]): Promise<any>;
  getTransactionById(transactionId: Transaction.Id): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.TransactionId & Account.AccountId): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.Id): Promise<unknown>;
  updateTransaction(doc: Transaction.Document): Promise<unknown>;
  listTransactions(match: PipelineStage.Match): Promise<Transaction.PaymentDocument[]>;
  listDeferredTransactions(ctx: {payingAccountIds?: Account.Id[]; transactionIds?: Transaction.Id[]}): Promise<Transaction.DeferredDocument[]>;
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
    listTransactions: (match) => {
      return mongodbService.inSession((session) => {
        const pipeline: PipelineStage[] = [
          match,
          {
            $lookup: {
              from: 'accounts',
              localField: 'account',
              foreignField: '_id',
              as: 'account',
            },
          },
          {
            $unwind: {
              path: '$account',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'projects',
              localField: 'project',
              foreignField: '_id',
              as: 'project',
            },
          },
          {
            $unwind: {
              path: '$project',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: {
              path: '$product',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'recipients',
              localField: 'recipient',
              foreignField: '_id',
              as: 'recipient',
            },
          },
          {
            $unwind: {
              path: '$recipient',
              preserveNullAndEmptyArrays: true,
            },
          },
        ];

        // if (secondMatch.$match.$and.length === 0) {
        //   pipeline.splice(3, 1);
        // }
        return mongodbService.transactions.aggregate(pipeline, {
          session,
        });

      });
    },
    listDeferredTransactions: ({ payingAccountIds, transactionIds }) => {
      return mongodbService.inSession((session) => {
        return mongodbService.transactions.aggregate<Transaction.DeferredDocument>([
          {
            $match: {
              ...(payingAccountIds?.length > 0 ? {
                payingAccount: {
                  $in: payingAccountIds.map(id => new Types.ObjectId(id)),
                },
              } : {}),
              ...(transactionIds?.length > 0 ? {
                _id: {
                  $in: transactionIds.map(id => new Types.ObjectId(id)),
                },
              } : {}),
              transactionType: 'deferred',
            },
          },
          ...listDeferredTransactions,
        ], {
          session,
        });
      });
    },
    listTransactionsByAccountId: ({ accountId, pageSize, pageNumber }) => {
      return mongodbService.inSession(async (session) => {
        const transactionIds = (await mongodbService.transactions.aggregate<Internal.Id>([
          ...listTransactionsByAccountId(accountId),
          {
            $skip: (pageNumber - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
        ], {
          session,
        })).map(d => d._id);

        return mongodbService.transactions.find({
          _id: {
            $in: transactionIds,
          },
        })
          .setOptions({
            session,
            populate: populate('project',
              'recipient',
              'account',
              'category',
              'product',
              'transferAccount',
              'payingAccount',
              'ownerAccount',
              'splits.category',
              'splits.project',
              'splits.product'),
            lean: true,
          })
          .exec();
      });
    },
  };

  return instance;
};
