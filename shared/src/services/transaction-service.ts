import { populate } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Account, Common, Transaction } from '@household/shared/types/types';
import { PipelineStage } from 'mongoose';

export interface ITransactionService {
  dumpTransactions(): Promise<Transaction.Document[]>;
  saveTransaction(doc: Transaction.Document): Promise<Transaction.Document>;
  saveTransactions(docs: Transaction.Document[]): Promise<any>;
  getTransactionById(transactionId: Transaction.Id): Promise<Transaction.Document>;
  getTransactionByIdAndAccountId(query: Transaction.TransactionId & Account.AccountId): Promise<Transaction.Document>;
  deleteTransaction(transactionId: Transaction.Id): Promise<unknown>;
  updateTransaction(doc: Transaction.Document): Promise<unknown>;
  listTransactions(firstMatch: PipelineStage.Match, secondMatch: PipelineStage.Match): Promise<Transaction.PaymentDocument[]>;
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
    listTransactions: (firstMatch, secondMatch) => {
      return mongodbService.inSession((session) => {
        const pipeline: PipelineStage[] = [
          firstMatch,
          {
            $unwind: {
              path: '$splits',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $set: {
              loan: {
                $ifNull: [
                  '$splits.loan',
                  '$loan',
                ],
              },
              description: {
                $ifNull: [
                  '$splits.description',
                  '$description',
                ],
              },
              amount: {
                $ifNull: [
                  '$splits.amount',
                  '$amount',
                ],
              },
              category: {
                $ifNull: [
                  '$splits.category',
                  '$category',
                ],
              },
              project: {
                $ifNull: [
                  '$splits.project',
                  '$project',
                ],
              },
              product: {
                $ifNull: [
                  '$splits.product',
                  '$product',
                ],
              },
              quantity: {
                $ifNull: [
                  '$splits.quantity',
                  '$quantity',
                ],
              },
              invoiceNumber: {
                $ifNull: [
                  '$splits.invoiceNumber',
                  '$invoiceNumber',
                ],
              },
              billingStartDate: {
                $ifNull: [
                  '$splits.billingStartDate',
                  '$billingStartDate',
                ],
              },
              billingEndDate: {
                $ifNull: [
                  '$splits.billingEndDate',
                  '$billingEndDate',
                ],
              },
            },
          },
          secondMatch,
          {
            $project: {
              splits: 0,
            },
          },
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

        if (secondMatch.$match.$and.length === 0) {
          pipeline.splice(3, 1);
        }
        return mongodbService.transactions.aggregate(pipeline, {
          session,
        });

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
