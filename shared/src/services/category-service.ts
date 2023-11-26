import { populate } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Category, Product } from '@household/shared/types/types';
import { ClientSession } from 'mongoose';

export interface ICategoryService {
  dumpCategories(): Promise<Category.Document[]>;
  saveCategory(doc: Category.Document): Promise<Category.Document>;
  getCategoryById(categoryId: Category.Id): Promise<Category.Document>;
  deleteCategory(categoryId: Category.Id): Promise<unknown>;
  updateCategory(doc: Category.Document, oldFullName: string): Promise<unknown>;
  listCategories(categoryType: Category.CategoryType): Promise<Category.Document[]>;
  listCategoriesByIds(categoryIds: Category.Id[]): Promise<Category.Document[]>;
  getCategoryByProductIds(productIds: Product.Id[]): Promise<Category.Document>;
  mergeCategories(ctx: {
    targetCategoryId: Category.Id;
    sourceCategoryIds: Category.Id[];
  }): Promise<unknown>;
}

export const categoryServiceFactory = (mongodbService: IMongodbService): ICategoryService => {
  const updateCategoryFullName = (oldName: string, newName: string, session: ClientSession): Promise<unknown> => {
    return mongodbService.categories().updateMany({
      fullName: {
        $regex: `^${oldName}:`,
      },
    }, [
      {
        $set: {
          fullName: {
            $replaceOne: {
              input: '$fullName',
              find: `${oldName}:`,
              replacement: `${newName}:`,
            },
          },
        },
      },
    ], {
      runValidators: true,
      session,
    })
      .exec();
  };

  const instance: ICategoryService = {
    dumpCategories: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.categories().find({}, null, {
          session,
        })
          .lean<Category.Document[]>()
          .exec();
      });
    },
    saveCategory: (doc) => {
      return mongodbService.categories().create(doc);
    },
    getCategoryById: async (categoryId) => {
      return !categoryId ? null : mongodbService.categories().findById(categoryId)
        .setOptions({
          populate: populate('parentCategory'),
          lean: true,
        })
        .exec();
    },
    deleteCategory: async (categoryId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const toDelete = await mongodbService.categories().findById(categoryId);
          await mongodbService.products().deleteMany({
            _id: {
              $in: toDelete.products,
            },
          }, {
            session,
          })
            .exec();

          await toDelete.deleteOne({
            session,
          });

          await mongodbService.categories().updateMany({
            parentCategory: toDelete,
          },
          toDelete.parentCategory ? {
            $set: {
              parentCategory: toDelete.parentCategory,
            },
          } : {
            $unset: {
              parentCategory: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          // await updateCategoryFullName(deleted.fullName, deleted.fullName.replace(new RegExp(`${deleted.name}$`), ''), session);
          await mongodbService.categories().updateMany({
            fullName: {
              $regex: `^${toDelete.fullName}`,
            },
          }, [
            {
              $set: {
                fullName: {
                  $replaceOne: {
                    input: '$fullName',
                    find: `${toDelete.fullName}:`,
                    replacement: toDelete.fullName.replace(new RegExp(`${toDelete.name}$`), ''),
                  },
                },
              },
            },
          ], {
            runValidators: true,
            session,
          })
            .exec();
          // TODO
          await mongodbService.transactions().updateMany({
            category: toDelete,
          }, toDelete.parentCategory ? {
            $set: {
              category: toDelete.parentCategory,
            },
          } : {
            $unset: {
              category: 1,
              inventory: 1,
              invoice: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions().updateMany({
            'splits.category': categoryId,
          }, toDelete.parentCategory ? {
            $set: {
              'splits.$[element].category': toDelete.parentCategory,
            },
          } : {
            $unset: {
              'splits.$[element].category': 1,
              'splits.$[element].inventory': 1,
              'splits.$[element].invoice': 1,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.category': categoryId,
              },
            ],
          })
            .exec();
        });
      });
    },
    updateCategory: async (doc, oldFullName) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.categories().replaceOne({
            _id: doc._id,
          }, doc, {
            runValidators: true,
            session,
          })
            .exec();
          await updateCategoryFullName(oldFullName, doc.fullName, session);
          await mongodbService.transactions().updateMany({
            category: doc._id,
          }, doc.categoryType === 'regular' ? {
            $unset: {
              invoice: 1,
              inventory: 1,
            },
          } : doc.categoryType === 'inventory' ? {
            $unset: {
              invoice: 1,
            },
          } : {
            $unset: {
              inventory: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions().updateMany({
            'splits.category': doc._id,
          }, doc.categoryType === 'regular' ? {
            $unset: {
              'splits.$[element].invoice': 1,
              'splits.$[element].inventory': 1,
            },
          } : doc.categoryType === 'inventory' ? {
            $unset: {
              'splits.$[element].invoice': 1,
            },
          } : {
            $unset: {
              'splits.$[element].inventory': 1,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.category': doc._id,
              },
            ],
          })
            .exec();
        });
      });
    },
    listCategories: ({ categoryType }) => {
      console.log(categoryType);
      return mongodbService.inSession((session) => {
        return mongodbService.categories()
          .find(categoryType ? {
            categoryType,
          } : undefined, null, {
            session,
          })
          .setOptions({
            populate: populate('parentCategory',
              {
                path: 'products',
                options: {
                  collation: {
                    locale: 'hu',
                  },
                  sort: {
                    fullName: 1,
                  },
                },
              },
            ),
          })
          .collation({
            locale: 'hu',
          })
          .sort('fullName')
          .lean<Category.Document[]>()
          .exec();
      });
    },
    listCategoriesByIds: (categoryIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.categories().find({
          _id: {
            $in: categoryIds,
          },
        }, null, {
          session,
        })
          .lean<Category.Document[]>()
          .exec();
      });
    },
    getCategoryByProductIds: (productIds) => {
      return mongodbService.inSession(async (session) => {
        return mongodbService.categories().findOne({
          products: {
            $all: productIds,
          },
        }, null, {
          session,
        })
          .lean<Category.Document>()
          .exec();
      });
    },
    mergeCategories: ({ targetCategoryId, sourceCategoryIds }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.categories().deleteMany({
            _id: {
              $in: sourceCategoryIds,
            },
          }, {
            session,
          });

          await mongodbService.transactions().updateMany({
            category: {
              $in: sourceCategoryIds,
            },
          }, {
            $set: {
              category: targetCategoryId,
            },
          }, {
            runValidators: true,
            session,
          });

          await mongodbService.transactions().updateMany({
            'splits.category': {
              $in: sourceCategoryIds,
            },
          }, {
            $set: {
              'splits.$[element].category': targetCategoryId,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.category': {
                  $in: sourceCategoryIds,
                },
              },
            ],
          });
        });
      });
    },
  };

  return instance;
};
