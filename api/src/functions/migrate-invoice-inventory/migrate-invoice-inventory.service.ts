import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IMigrateInvoiceInventoryService {
  (): Promise<void>;
}

export const migrateInvoiceInventoryServiceFactory = (mongodbService: IMongodbService): IMigrateInvoiceInventoryService => {
  return async () => {
    await mongodbService.inSession((session) => {
      return session.withTransaction(async () => {
        await mongodbService.transactions.updateMany({
          $or: [
            {
              inventory: {
                $exists: 1,
              },
            },
            {
              invoice: {
                $exists: 1,
              },
            },
          ],
        }, [
          {
            $set: {
              quantity: '$inventory.quantity',
              product: '$inventory.product',
              invoiceNumber: '$invoice.invoiceNumber',
              billingStartDate: '$invoice.billingStartDate',
              billindgEndDate: '$invoice.billingEndDate',
            },
          },
          {
            $unset: [
              'invoice',
              'inventory',
            ],
          },
        ], {
          session,
        }).exec();

        await mongodbService.transactions.aggregate(
          [
            {
              $match: {
                $or: [
                  {
                    'splits.inventory': {
                      $exists: true,
                    },
                  },
                  {
                    'splits.invoice': {
                      $exists: true,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$splits',
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $addFields: {
                'splits.quantity': '$splits.inventory.quantity',
                'splits.product': '$splits.inventory.product',
                'splits.invoiceNumber': '$splits.invoice.invoiceNumber',
                'splits.billingStartDate': '$splits.invoice.billingStartDate',
                'splits.billingEndDate': '$splits.invoice.billingEndDate',
              },
            },
            {
              $project: {
                'splits.inventory': 0,
                'splits.invoice': 0,
              },
            },
            {
              $group: {
                _id: '$_id',
                splits: {
                  $push: '$$ROOT.splits',
                },
              },
            },
            {
              $merge: {
                into: 'transactions',
                on: '_id',
              },
            },
          ],
        );
      }, {
        session,
      });
    });
  };
};
