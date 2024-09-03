import { IMongodbService } from '@household/shared/services/mongodb-service';

export interface IMigrateCategoriesService {
  (): Promise<void>;
}

export const migrateCategoriesServiceFactory = (mongodbService: IMongodbService): IMigrateCategoriesService => {
  return async () => {
    await mongodbService.categories.collection.dropIndex({
      fullName: 1,
    } as any);

    await mongodbService.inSession((session) => {
      return session.withTransaction(async () => {

        const categories = await mongodbService.categories.find({
          ancestors: {
            $exists: false,
          },
        }, null, {
          sort: {
            fullName: 1,
          },
          session,
          lean: true,
        });

        categories.forEach((category) => {
          if (!(category as any).parentCategory) {
            category.ancestors = [];
          } else {
            const parentCategory = categories.find(c => c._id.toString() === (category as any).parentCategory._id.toString());
            category.ancestors = [
              ...parentCategory.ancestors,
              (category as any).parentCategory,
            ];
          }
        });

        await mongodbService.categories.bulkWrite(categories.map(doc => {

          return {
            updateOne: {
              filter: {
                _id: doc._id,
              },
              update: {
                $set: {
                  ancestors: doc.ancestors,
                },
                $unset: {
                  parentCategory: 1,
                  fullName: 1,
                },
              },
            },
          };
        }), {
          strict: false,
          session,
        });
      });
    });
  };
};
