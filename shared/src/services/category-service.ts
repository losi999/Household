import { DocumentUpdate } from '@household/shared/types/common';
import { CategoryType } from '@household/shared/enums';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Types } from 'mongoose';

export interface ICategoryService {
  saveCategory(doc: Documents.Category): Promise<Documents.Category>;
  saveCategories(...docs: Documents.Category[]): Promise<unknown>;
  findCategoryById(categoryId: Api.Category.Id): Promise<Documents.Category>;
  getCategoryById(categoryId: Api.Category.Id): Promise<Documents.Category>;
  deleteCategory(categoryId: Api.Category.Id): Promise<unknown>;
  updateCategory(categoryId: Api.Category.Id, updateQuery: DocumentUpdate<Documents.Category>): Promise<unknown>;
  listCategories(): Promise<Documents.Category[]>;
  findCategoriesByIds(categoryIds: Api.Category.Id[]): Promise<Documents.Category[]>;
  mergeCategories(ctx: {
    targetCategoryId: Api.Category.Id;
    sourceCategoryIds: Api.Category.Id[];
  }): Promise<unknown>;
}

export const categoryServiceFactory = (mongodbService: IMongodbService): ICategoryService => {
  const instance: ICategoryService = {
    saveCategory: async(doc) => {
      const [category] = await mongodbService.categories((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return category;
    },
    saveCategories: (...docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.categories.insertMany(docs, {
          session,
        });
      });
    },
    findCategoryById: async (categoryId) => {
      if (categoryId) {
        return mongodbService.categories((model, session) => {
          return model.findById(categoryId)
            .lean()
            .session(session);
        });
      }        
    },
    getCategoryById: async (categoryId) => {
      if (categoryId) {
        return mongodbService.categories((model, session) => {
          return model.findById(categoryId)
            .session(session)
            .populate('ancestors')
            .lean();
        });
      }        
    },
    deleteCategory: async (categoryId) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.categories.findByIdAndDelete(categoryId, {
          session,
        });

        await models.products.deleteMany({
          category: categoryId,
        }, {
          session,
        }) ;

        await models.categories.updateMany({
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
        await models.transactions.updateMany({
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
        await models.transactions.updateMany({
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

        await models.transactions.updateMany({
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
    },
    updateCategory: async (categoryId, { update: updateQuery }) => {
      return mongodbService.inTransaction(async (models, session) => {
        const doc = await models.categories.findByIdAndUpdate(categoryId, updateQuery, {
          runValidators: true,
          session,
          returnDocument: 'before',
        });

        await models.categories.updateMany({
          ancestors: categoryId,
        }, [
          {
            $set: {
              ancestors: {
                $concatArrays: [
                  updateQuery.$set.ancestors.map((a: Documents.Category) => a._id),
                  {
                    $filter: {
                      input: '$ancestors',
                      as: 'ancestorId',
                      cond: {
                        $not: {
                          $in: [
                            '$$ancestorId',
                            doc.ancestors.map((a: Documents.Category) => a._id),
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ], {
          session,
          updatePipeline: true,
        });

        await models.transactions.updateMany({
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

        await models.transactions.updateMany({
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

        await models.transactions.updateMany({
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
    },
    listCategories: () => {
      return mongodbService.categories((model, session) => {
        return model.find()
          .session(session)
          .populate('ancestors')
          .lean();
      });
    },
    findCategoriesByIds: async(categoryIds) => {
      if (!categoryIds?.length) {
        return [];
      }
      
      return mongodbService.categories((model, session) => {
        return model.find({
          _id: {
            $in: categoryIds,
          },
        }).session(session)
          .lean();
          
      });
    },
    mergeCategories: ({ targetCategoryId, sourceCategoryIds }) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.categories.deleteMany({
          _id: {
            $in: sourceCategoryIds,
          },
        }, {
          session,
        });

        const targetCategory = await models.categories.findById(targetCategoryId);
        const newAncestors = [
          ...targetCategory.ancestors.map(a => a._id),
          targetCategory._id,
        ];

        for (const sourceCategoryId of sourceCategoryIds) {
          await models.categories.updateMany({
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
            updatePipeline: true,
          });
        }

        await models.products.updateMany({
          category: {
            $in: sourceCategoryIds as any,
          },
        }, {
          $set: {
            category: targetCategoryId,
          },
        }, {
          session,
        });

        await models.transactions.updateMany({
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

        await models.transactions.updateMany({
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

        await models.transactions.updateMany({
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
    },
  };

  return instance;
};
