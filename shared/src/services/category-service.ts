import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Category } from '@household/shared/types/types';
import { ClientSession, Types, UpdateQuery } from 'mongoose';

export interface ICategoryService {
  dumpCategories(): Promise<Category.Document[]>;
  saveCategory(doc: Category.Document): Promise<Category.Document>;
  getCategoryById(categoryId: Category.Id): Promise<Category.Document>;
  deleteCategory(categoryId: Category.Id): Promise<unknown>;
  updateCategory(categoryId: Category.Id, updateQuery: UpdateQuery<Category.Document>, oldFullName: string): Promise<unknown>;
  listCategories(categoryType: Category.CategoryType): Promise<Category.Document[]>;
  listCategoriesByIds(categoryIds: Category.Id[]): Promise<Category.Document[]>;
  mergeCategories(ctx: {
    targetCategoryId: Category.Id;
    sourceCategoryIds: Category.Id[];
  }): Promise<unknown>;
}

export const categoryServiceFactory = (mongodbService: IMongodbService): ICategoryService => {
  const updateCategoryFullName = (oldName: string, newName: string, session: ClientSession): Promise<unknown> => {
    return mongodbService.categories.updateMany({
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
        return mongodbService.categories.find({}, null, {
          session,
        })
          .lean<Category.Document[]>()
          .exec();
      });
    },
    saveCategory: (doc) => {
      return mongodbService.categories.create(doc);
    },
    getCategoryById: async (categoryId) => {
      let category: Category.Document;
      if (categoryId) {
        [category] = await mongodbService.categories
          .aggregate()
          .match({
            _id: new Types.ObjectId(categoryId),
          })
          .lookup({
            from: 'categories',
            localField: 'parentCategory',
            foreignField: '_id',
            as: 'parentCategory',
          })
          .lookup({
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
            pipeline: [
              {
                $sort: {
                  fullName: 1,
                },
              },
            ],
          })
          .addFields({
            parentCategory: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $size: '$parentCategory',
                    },
                    0,
                  ],
                },
                then: '$$REMOVE',
                else: {
                  $arrayElemAt: [
                    '$parentCategory',
                    0,
                  ],
                },

              },
            },
            products: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $size: '$products',
                    },
                    0,
                  ],
                },
                then: '$$REMOVE',
                else: '$products',
              },
            },
          })
          .exec();
      }

      return category ?? null;
    },
    deleteCategory: async (categoryId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const toDelete = await mongodbService.categories.findById(categoryId);
          await mongodbService.products.deleteMany({
            category: categoryId,
          }, {
            session,
          })
            .exec();

          await toDelete.deleteOne({
            session,
          });

          await mongodbService.categories.updateMany({
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
          await mongodbService.categories.updateMany({
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
          await mongodbService.transactions.updateMany({
            category: toDelete,
          }, toDelete.parentCategory ? {
            $set: {
              category: toDelete.parentCategory,
            },
          } : {
            $unset: {
              category: 1,
              quantity: 1,
              product: 1,
              invoiceNumber: 1,
              billingEndDate: 1,
              billingStartDate: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
            'splits.category': categoryId,
          }, toDelete.parentCategory ? {
            $set: {
              'splits.$[element].category': toDelete.parentCategory,
            },
          } : {
            $unset: {
              'splits.$[element].category': 1,
              'splits.$[element].quantity': 1,
              'splits.$[element].product': 1,
              'splits.$[element].invoiceNumber': 1,
              'splits.$[element].billingEndDate': 1,
              'splits.$[element].billingStartDate': 1,
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
    updateCategory: async (categoryId, updateQuery, oldFullName) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const doc = await mongodbService.categories.findByIdAndUpdate(categoryId, updateQuery, {
            runValidators: true,
            session,
            returnDocument: 'after',
          })
            .exec();

          await updateCategoryFullName(oldFullName, doc.fullName, session);
          await mongodbService.transactions.updateMany({
            category: categoryId,
          }, doc.categoryType === 'regular' ? {
            $unset: {
              quantity: 1,
              product: 1,
              invoiceNumber: 1,
              billingEndDate: 1,
              billingStartDate: 1,
            },
          } : doc.categoryType === 'inventory' ? {
            $unset: {
              invoiceNumber: 1,
              billingEndDate: 1,
              billingStartDate: 1,
            },
          } : {
            $unset: {
              quantity: 1,
              product: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
            'splits.category': categoryId,
          }, doc.categoryType === 'regular' ? {
            $unset: {
              'splits.$[element].quantity': 1,
              'splits.$[element].product': 1,
              'splits.$[element].invoiceNumber': 1,
              'splits.$[element].billingEndDate': 1,
              'splits.$[element].billingStartDate': 1,
            },
          } : doc.categoryType === 'inventory' ? {
            $unset: {
              'splits.$[element].invoiceNumber': 1,
              'splits.$[element].billingEndDate': 1,
              'splits.$[element].billingStartDate': 1,
            },
          } : {
            $unset: {
              'splits.$[element].quantity': 1,
              'splits.$[element].product': 1,
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
    listCategories: ({ categoryType }) => {
      return mongodbService.inSession((session) => {
        const aggregate = mongodbService.categories
          .aggregate()
          .session(session);

        if (categoryType) {
          aggregate.match({
            categoryType,
          });
        }

        aggregate.lookup({
          from: 'categories',
          localField: 'parentCategory',
          foreignField: '_id',
          as: 'parentCategory',
        })
          .lookup({
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
            pipeline: [
              {
                $sort: {
                  fullName: 1,
                },
              },
            ],
          })
          .addFields({
            parentCategory: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $size: '$parentCategory',
                    },
                    0,
                  ],
                },
                then: '$$REMOVE',
                else: {
                  $arrayElemAt: [
                    '$parentCategory',
                    0,
                  ],
                },

              },
            },
            products: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $size: '$products',
                    },
                    0,
                  ],
                },
                then: '$$REMOVE',
                else: '$products',
              },
            },
          })
          .collation({
            locale: 'hu',
          })
          .sort('fullName');

        return aggregate.exec();
      });
    },
    listCategoriesByIds: (categoryIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.categories.find({
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
    mergeCategories: ({ targetCategoryId, sourceCategoryIds }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.categories.deleteMany({
            _id: {
              $in: sourceCategoryIds,
            },
          }, {
            session,
          });

          await mongodbService.products.updateMany({
            category: {
              $in: sourceCategoryIds,
            },
          }, {
            $set: {
              category: targetCategoryId,
            },
          }, {
            session,
          });

          await mongodbService.transactions.updateMany({
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

          await mongodbService.transactions.updateMany({
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
