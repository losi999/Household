import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Product } from '@household/shared/types/types';

export interface IProductService {
  dumpProducts(): Promise<Product.Document[]>;
  saveProduct(doc: Product.Document): Promise<Product.Document>;
  getProductById(productId: Product.Id): Promise<Product.Document>;
  listProductsByIds(productIds: Product.Id[]): Promise<Product.Document[]>;
  deleteProduct(productId: Product.Id): Promise<unknown>;
  updateProduct(doc: Product.Document): Promise<unknown>;
  mergeProducts(ctx: {
    targetProductId: Product.Id;
    sourceProductIds: Product.Id[];
  }): Promise<unknown>;
  // listProducts(): Promise<Product.Document[]>;
}

export const productServiceFactory = (mongodbService: IMongodbService): IProductService => {

  const instance: IProductService = {
    dumpProducts: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.products().find({})
          .setOptions({
            session,
            lean: true,
          })
          .exec();
      });
    },
    saveProduct: async (doc) => {
      return mongodbService.products().create(doc);
    },
    getProductById: async (productId) => {
      return !productId ? null : mongodbService.products().findById(productId)
        .setOptions({
          lean: true,
        })
        .exec();
    },
    listProductsByIds: (productIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.products().find({
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
          await mongodbService.products().deleteOne({
            _id: productId,
          }, {
            session,
          })
            .exec();
          await mongodbService.transactions().updateMany({
            'inventory.product': productId,
          }, {
            $unset: {
              inventory: 1,
            },
          }, {
            runValidators: true,
            session,
          })
            .exec();
          await mongodbService.transactions().updateMany({
            'splits.inventory.product': productId,
          }, {

            $unset: {
              'splits.$[element].inventory': 1,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.inventory.product': productId,
              },
            ],
          })
            .exec();
        });
      });
    },
    updateProduct: (doc) => {
      return mongodbService.products().replaceOne({
        _id: doc._id,
      }, doc, {
        runValidators: true,
      })
        .exec();
    },
    mergeProducts: ({ targetProductId, sourceProductIds }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.products().deleteMany({
            _id: {
              $in: sourceProductIds,
            },
          }, {
            session,
          });

          await mongodbService.transactions().updateMany({
            'inventory.product': {
              $in: sourceProductIds,
            },
          }, {
            $set: {
              'inventory.product': targetProductId,
            },
          }, {
            runValidators: true,
            session,
          });

          await mongodbService.transactions().updateMany({
            'splits.inventory.product': {
              $in: sourceProductIds,
            },
          }, {
            $set: {
              'splits.$[element].inventory.product': targetProductId,
            },
          }, {
            session,
            runValidators: true,
            arrayFilters: [
              {
                'element.inventory.product': {
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
    //     return mongodbService.products().find({}, null, {
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
