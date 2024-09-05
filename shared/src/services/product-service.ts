import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Category, Product } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IProductService {
  dumpProducts(): Promise<Product.Document[]>;
  saveProduct(doc: Product.Document): Promise<Product.Document>;
  saveProducts(docs: Product.Document[]): Promise<unknown>;
  getProductById(productId: Product.Id): Promise<Product.Document>;
  listProductsByIds(productIds: Product.Id[]): Promise<Product.Document[]>;
  deleteProduct(productId: Product.Id): Promise<unknown>;
  updateProduct(productId: Product.Id, updateQuery: UpdateQuery<Product.Document>): Promise<unknown>;
  mergeProducts(ctx: {
    targetProductId: Product.Id;
    sourceProductIds: Product.Id[];
  }): Promise<unknown>;
  listProducts(): Promise<Category.Document[]>;
}

export const productServiceFactory = (mongodbService: IMongodbService): IProductService => {

  const instance: IProductService = {
    dumpProducts: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.products.find({})
          .setOptions({
            session,
            lean: true,
          })
          .exec();
      });
    },
    listProducts: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.products.aggregate([
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
      return mongodbService.products.create(doc);
    },
    saveProducts: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.products.insertMany(docs, {
            session,
          });
        });
      });
    },
    getProductById: async (productId) => {
      return !productId ? null : mongodbService.products.findById(productId)
        .setOptions({
          lean: true,
        })
        .exec();
    },
    listProductsByIds: (productIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.products.find({
          _id: {
            $in: productIds,
          },
        })
          .populate('category')
          .setOptions({
            session,
            lean: true,
          })
          .exec();

      });
    },
    deleteProduct: async (productId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.products.deleteOne({
            _id: productId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
            product: productId,
          }, {
            $unset: {
              product: 1,
              quantity: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions.updateMany({
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
          })
            .exec();
          await mongodbService.transactions.updateMany({
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
          })
            .exec();
        });
      });
    },
    updateProduct: async (productId, updateQuery) => {
      return mongodbService.products.findByIdAndUpdate(productId, updateQuery, {
        runValidators: true,
      });
    },
    mergeProducts: ({ targetProductId, sourceProductIds }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.products.deleteMany({
            _id: {
              $in: sourceProductIds,
            },
          }, {
            session,
          });

          await mongodbService.transactions.updateMany({
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

          await mongodbService.transactions.updateMany({
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

          await mongodbService.transactions.updateMany({
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
      });
    },
    // listProducts: () => {
    //   return mongodbService.inSession((session) => {
    //     return mongodbService.products.find({}, null, {
    //       session,
    //     })
    //       .collation({
    //         locale: 'hu',
    //       })
    //       .sort('name')
    //       .lean()
    //       .exec();
    //   });
    // },
  };

  return instance;
};
