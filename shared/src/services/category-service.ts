import { CategoryType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Category } from '@household/shared/types/types';
import { Types, UpdateQuery } from 'mongoose';

export interface ICategoryService {
  dumpCategories(): Promise<Category.Document[]>;
  saveCategory(doc: Category.Document): Promise<Category.Document>;
  saveCategories(docs: Category.Document[]): Promise<unknown>;
  getCategoryById(categoryId: Category.Id): Promise<Category.Document>;
  deleteCategory(categoryId: Category.Id): Promise<unknown>;
  updateCategory(categoryId: Category.Id, updateQuery: UpdateQuery<Category.Document>): Promise<unknown>;
  listCategories(): Promise<Category.Document[]>;
  listCategoriesByIds(categoryIds: Category.Id[]): Promise<Category.Document[]>;
  mergeCategories(ctx: {
    targetCategoryId: Category.Id;
    sourceCategoryIds: Category.Id[];
  }): Promise<unknown>;
}

export const categoryServiceFactory = (mongodbService: IMongodbService): ICategoryService => {
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
    saveCategories: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.categories.insertMany(docs, {
            session,
          });
        });
      });
    },
    getCategoryById: async (categoryId) => {
      return !categoryId ? undefined : mongodbService.categories.findById(categoryId)
        .populate('ancestors')
        .sort('fullName')
        .lean<Category.Document>()
        .exec();
    },
    deleteCategory: async (categoryId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.categories.findByIdAndDelete(categoryId, {
            session,
          });

          await mongodbService.products.deleteMany({
            category: categoryId,
          }, {
            session,
          }) ;

          await mongodbService.categories.updateMany({
            ancestors: categoryId,
          }, {
            $pull: {
              ancestors: categoryId,
            },
          }, {
            runValidators: true,
            session,
          });

          // TODO
          await mongodbService.transactions.updateMany({
            category: categoryId,
          }, {
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
          });
          await mongodbService.transactions.updateMany({
            'splits.category': categoryId,
          }, {
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
          });

          await mongodbService.transactions.updateMany({
            'deferredSplits.category': categoryId,
          }, {
            $unset: {
              'deferredSplits.$[element].category': 1,
              'deferredSplits.$[element].quantity': 1,
              'deferredSplits.$[element].product': 1,
              'deferredSplits.$[element].invoiceNumber': 1,
              'deferredSplits.$[element].billingEndDate': 1,
              'deferredSplits.$[element].billingStartDate': 1,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.category': categoryId,
              },
            ],
          });
        });
      });
    },
    updateCategory: async (categoryId, updateQuery) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const doc = await mongodbService.categories.findByIdAndUpdate(categoryId, updateQuery, {
            runValidators: true,
            session,
            returnDocument: 'before',
          });

          await mongodbService.categories.updateMany({
            ancestors: categoryId,
          }, [
            {
              $set: {
                ancestors: {
                  $concatArrays: [
                    updateQuery.$set.ancestors.map((a: Category.Document) => a._id),
                    {
                      $filter: {
                        input: '$ancestors',
                        as: 'ancestorId',
                        cond: {
                          $not: {
                            $in: [
                              '$$ancestorId',
                              doc.ancestors.map(a => a._id),
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ]);

          await mongodbService.transactions.updateMany({
            category: categoryId,
          }, updateQuery.$set.categoryType === CategoryType.Regular ? {
            $unset: {
              quantity: 1,
              product: 1,
              invoiceNumber: 1,
              billingEndDate: 1,
              billingStartDate: 1,
            },
          } : updateQuery.$set.categoryType === CategoryType.Inventory ? {
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
          }) ;

          await mongodbService.transactions.updateMany({
            'splits.category': categoryId,
          }, updateQuery.$set.categoryType === CategoryType.Regular ? {
            $unset: {
              'splits.$[element].quantity': 1,
              'splits.$[element].product': 1,
              'splits.$[element].invoiceNumber': 1,
              'splits.$[element].billingEndDate': 1,
              'splits.$[element].billingStartDate': 1,
            },
          } : updateQuery.$set.categoryType === CategoryType.Inventory ? {
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
          });

          await mongodbService.transactions.updateMany({
            'deferredSplits.category': categoryId,
          }, updateQuery.$set.categoryType === CategoryType.Regular ? {
            $unset: {
              'deferredSplits.$[element].quantity': 1,
              'deferredSplits.$[element].product': 1,
              'deferredSplits.$[element].invoiceNumber': 1,
              'deferredSplits.$[element].billingEndDate': 1,
              'deferredSplits.$[element].billingStartDate': 1,
            },
          } : updateQuery.$set.categoryType === CategoryType.Inventory ? {
            $unset: {
              'deferredSplits.$[element].invoiceNumber': 1,
              'deferredSplits.$[element].billingEndDate': 1,
              'deferredSplits.$[element].billingStartDate': 1,
            },
          } : {
            $unset: {
              'deferredSplits.$[element].quantity': 1,
              'deferredSplits.$[element].product': 1,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.category': categoryId,
              },
            ],
          });
        });
      });
    },
    listCategories: () => {
      return mongodbService.categories.find()
        .populate('ancestors')
        .lean<Category.Document[]>();
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

          const targetCategory = await mongodbService.categories.findById(targetCategoryId);
          const newAncestors = [
            ...targetCategory.ancestors.map(a => a._id),
            targetCategory._id,
          ];

          for (const sourceCategoryId of sourceCategoryIds) {
            await mongodbService.categories.updateMany({
              ancestors: sourceCategoryId,
            }, [
              {
                $set: {
                  ancestors: {
                    $concatArrays: [
                      newAncestors,
                      {
                        $filter: {
                          input: '$ancestors',
                          as: 'ancestorId',
                          cond: {
                            $gt: [
                              {
                                $indexOfArray: [
                                  '$ancestors',
                                  '$$ancestorId',
                                ],
                              },
                              {
                                $indexOfArray: [
                                  '$ancestors',
                                  new Types.ObjectId(sourceCategoryId),
                                ],
                              },
                            ],
                          },
                        },
                      },
                    ],

                  },
                },
              },
            ], {
              session,
            });
          }

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

          await mongodbService.transactions.updateMany({
            'deferredSplits.category': {
              $in: sourceCategoryIds,
            },
          }, {
            $set: {
              'deferredSplits.$[element].category': targetCategoryId,
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
