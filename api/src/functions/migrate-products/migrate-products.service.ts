import { getCategoryId } from '@household/shared/common/utils';
import { ProductType, SettingKey, TransactionType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { ISettingService } from '@household/shared/services/setting-service';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { AnyBulkWriteOperation, Types } from 'mongoose';

export interface IMigrateProductsService {
  (): Promise<void>;
}

export const migrateProductsServiceFactory = (settingService: ISettingService, mongodbService: IMongodbService): IMigrateProductsService => {
  return async () => {
    const { value: inventoryCategoryId } = await settingService.getSettingByKey<Api.Category.Id>(SettingKey.InventoryCategory);

    await mongodbService.products((model) => {
      return model.cleanIndexes();
    });

    const childCategories = await mongodbService.categories((model, session) => {
      return model.find({
        ancestors: inventoryCategoryId,
      })
        .session(session)
        .lean();
    });

    console.log('number of categories to migrate to generic products', childCategories.length);

    const categoriesToDelete = childCategories.map(c => c._id.toString());

    const genericProducts = childCategories.map<Documents.GenericProduct>((c) => {
      return {
        _id: c._id,
        expiresAt: undefined,
        name: c.name,
        productType: ProductType.Generic,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    const oldProductDocuments = (await mongodbService.products((model, session) => {
      return model.find({
        productType: {
          $exists: false,
        },
      }).session(session)
        .lean();
    })) as unknown as (Documents.Id & Api.Product.UnitOfMeasurement & Api.Product.Measurement & Api.Product.FullName & {
      createdAt?: Date;
      updatedAt?: Date;
      brand: string;
      category: Types.ObjectId;
    })[];

    console.log('number of old products to migrate to specific products', oldProductDocuments.length);

    const specificProductUpdates = oldProductDocuments.map<AnyBulkWriteOperation<Documents.SpecificProduct>>((p) => {
      return {
        updateOne: {
          filter: {
            _id: p._id,
          },
          update: {
            $set: {
              name: p.brand,
              productType: ProductType.Specific,
              genericProduct: genericProducts.find(c => c._id.toString() === p.category.toString()),
            },
            $unset: {
              fullName: 1,
              brand: 1,
              category: 1,
            },
          },
        },
      };
    });

    const transactions = await mongodbService.transactions((model, session) => {
      return model.find({
        $or: [
          {
            category: {
              $in: categoriesToDelete,
            },
          },
          {
            'splits.category': {
              $in: categoriesToDelete,
            },
          },
          {
            'deferredSplits.category': {
              $in: categoriesToDelete,
            },
          },
        ],
      }, undefined, {
        session,
      });
    });

    console.log('number of transactions found to migrate', transactions.length);

    const transactionUpdates = transactions.map<AnyBulkWriteOperation< Documents.Transaction>>((t) => {
      if (t.transactionType === TransactionType.Payment || t.transactionType === TransactionType.Deferred || t.transactionType === TransactionType.Reimbursement) {
        if (t.product) {
          return {
            updateOne: {
              filter: {
                _id: t._id,
              },
              update: {
                $set: {
                  category: inventoryCategoryId,
                },
              },
            },
          };    
        }

        return {
          updateOne: {
            filter: {
              _id: t._id,
            },
            update: {
              $set: {
                category: inventoryCategoryId,
                product: t.category,
              },
            },
          },
        };
      }

      if (t.transactionType === TransactionType.Split) {
        const update: any = {};
        t.splits.forEach((split, index) => {
          if (categoriesToDelete.includes(getCategoryId(split.category))) {
            if (split.product) {
              update[`splits.${index}.category`] = inventoryCategoryId;
            } else {
              update[`splits.${index}.category`] = inventoryCategoryId;
              update[`splits.${index}.product`] = split.category;
            }
          }
        });

        t.deferredSplits.forEach((split, index) => {
          if (categoriesToDelete.includes(getCategoryId(split.category))) {
            if (split.product) {
              update[`deferredSplits.${index}.category`] = inventoryCategoryId;
            } else {
              update[`deferredSplits.${index}.category`] = inventoryCategoryId;
              update[`deferredSplits.${index}.product`] = split.category;
            }
          }
        });

        return {
          updateOne: {
            filter: {
              _id: t._id,
            },
            update,
          },
        };
      }

      throw 'Unexpected transaction type';
    });

    await mongodbService.inTransaction(async ({ categories, products, transactions }, session) => {
      const res1 = await products.insertMany(genericProducts, {
        session,
      });

      console.log(res1);

      const res2 = await products.bulkWrite(specificProductUpdates, {
        session,
        strict: false,
      });

      console.log(res2);

      const res3 = await categories.deleteMany({
        _id: {
          $in: categoriesToDelete,
        },
      }, {
        session,
      });

      console.log(res3);

      const res4 = await transactions.bulkWrite(transactionUpdates, {
        session,
        strict: false,
      });

      console.log(res4);
    });
  };
};
