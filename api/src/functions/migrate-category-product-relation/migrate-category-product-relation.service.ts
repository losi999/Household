import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IMigrateCategoryProductRelationService {
  (): Promise<void>;
}

export const migrateCategoryProductRelationServiceFactory = (mongodbService: IMongodbService): IMigrateCategoryProductRelationService =>
  async () => {
    const categoriesWithProducts = await mongodbService.categories().find({
      products: {
        $exists: true,
        $not: {
          $size: 0,
        },
      },
    })
      .lean();

    await mongodbService.inSession((session) => {
      return session.withTransaction(async () => {
        for (const category of categoriesWithProducts) {
          for (const product of category.products) {
            await mongodbService.products().updateOne({
              _id: product,
            }, {
              category,
            }, {
              session,
            });
          }

          await mongodbService.categories().updateOne({
            _id: category._id,
          }, {
            $unset: {
              products: 1,
            },
          }, {
            session,
            strict: false,
          });
        }
      });
    });
  };
