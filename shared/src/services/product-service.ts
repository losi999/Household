import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Category, Product } from '@household/shared/types/types';

export interface IProductService {
  saveProduct(doc: Product.Document): Promise<Product.Document>;
  saveProducts(...docs: Product.Document[]): Promise<unknown>;
  findProductById(productId: Product.Id): Promise<Product.Document>;
  listProductsByIds(productIds: Product.Id[]): Promise<Product.Document[]>;
  deleteProduct(productId: Product.Id): Promise<unknown>;
  updateProduct(productId: Product.Id, updateQuery: DocumentUpdate<Product.Document>): Promise<unknown>;
  mergeProducts(ctx: {
    targetProductId: Product.Id;
    sourceProductIds: Product.Id[];
  }): Promise<unknown>;
  listProducts(): Promise<Category.Document[]>;
}

export const productServiceFactory = (mongodbService: IMongodbService): IProductService => {

  const instance: IProductService = {
    listProducts: () => {
      return mongodbService.products((model, session) => {
        return model.aggregate([
          {
            $sort: {
              fullName: 1,
            },
          },
          {
            $group: {
              _id: '$category',
              products: {
                $push: '$$ROOT',
              },
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category',
              pipeline: [
                {
                  $lookup: {
                    from: 'categories',
                    localField: 'ancestors',
                    foreignField: '_id',
                    as: 'ancestors',
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: '$category',
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  '$$ROOT',
                  '$category',
                ],
              },
            },
          },
          {
            $unset: [
              'category',
              'products.category',
            ],
          },
        ], {
          session,
          collation: {
            locale: 'hu',
          },
        });
      });
    },
    saveProduct: async (doc) => {
      const [product] = await mongodbService.products((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return product;
    },
    saveProducts: (...docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.products.insertMany(docs, {
          session,
        });
      });
    },
    findProductById: async (productId) => {
      if (productId) {
        return mongodbService.products((model, session) => {
          return model.findById(productId)
            .setOptions({
              lean: true,
              session,
            });
        });
      }        
    },
    listProductsByIds: async (productIds) => {
      if(!productIds?.length) {
        return [];
      }

      return mongodbService.products((model, session) => {
        return model.find({
          _id: {
            $in: productIds,
          },
        })
          .populate('category')
          .setOptions({
            session,
            lean: true,
          });
      });
    },
    deleteProduct: async (productId) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.products.deleteOne({
          _id: productId,
        }, {
          session,
        });
          
        await models.transactions.updateMany({
          product: productId,
        }, {
          $unset: {
            product: 1,
            quantity: 1,
          },
        }, {
          runValidators: true,
          session,
        });
          
        await models.transactions.updateMany({
          'splits.product': productId,
        }, {

          $unset: {
            'splits.$[element].product': 1,
            'splits.$[element].quantity': 1,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.product': productId,
            },
          ],
        });
          
        await models.transactions.updateMany({
          'deferredSplits.product': productId,
        }, {

          $unset: {
            'deferredSplits.$[element].product': 1,
            'deferredSplits.$[element].quantity': 1,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.product': productId,
            },
          ],
        });
      });
    },
    updateProduct: async (productId, { update }) => {
      return mongodbService.products((model, session) => {
        return model.findByIdAndUpdate(productId, update, {
          runValidators: true,
          session,
        });
      });
    },
    mergeProducts: ({ targetProductId, sourceProductIds }) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.products.deleteMany({
          _id: {
            $in: sourceProductIds,
          },
        }, {
          session,
        });

        await models.transactions.updateMany({
          product: {
            $in: sourceProductIds,
          },
        }, {
          $set: {
            product: targetProductId,
          },
        }, {
          runValidators: true,
          session,
        });

        await models.transactions.updateMany({
          'splits.product': {
            $in: sourceProductIds,
          },
        }, {
          $set: {
            'splits.$[element].product': targetProductId,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.product': {
                $in: sourceProductIds,
              },
            },
          ],
        });

        await models.transactions.updateMany({
          'deferredSplits.product': {
            $in: sourceProductIds,
          },
        }, {
          $set: {
            'deferredSplits.$[element].product': targetProductId,
          },
        }, {
          session,
          runValidators: true,
          arrayFilters: [
            {
              'element.product': {
                $in: sourceProductIds,
              },
            },
          ],
        });
      });
    },
  };

  return instance;
};
