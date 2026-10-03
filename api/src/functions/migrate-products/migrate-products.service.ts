import { ProductType, SettingKey } from '@household/shared/enums';
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
    const { value: categoryId } = await settingService.getSettingByKey<Api.Category.Id>(SettingKey.InventoryCategory);

    const childCategories = await mongodbService.categories((model, session) => {
      return model.find({
        ancestors: categoryId,
      })
        .session(session)
        .lean();
    });
    const categoriesToDelete = childCategories.map(c => c._id);

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
              brand: 1,
              category: 1,
            },
          },
        },
      };
    });

    await mongodbService.inTransaction(async ({ categories, products }, session) => {
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
    });
  };
};
