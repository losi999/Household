import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Product } from '@household/shared/types/types';

export interface IProductService {
  // dumpProducts(): Promise<Product.Document[]>;
  saveProduct(doc: Product.Document): Promise<Product.Document>;
  getProductById(productId: Product.IdType): Promise<Product.Document>;
  listProductsByIds(productIds: Product.IdType[]): Promise<Product.Document[]>;
  // deleteProduct(productId: Product.IdType): Promise<unknown>;
  // updateProduct(doc: Product.Document): Promise<unknown>;
  // listProducts(): Promise<Product.Document[]>;
}

export const productServiceFactory = (mongodbService: IMongodbService): IProductService => {

  const instance: IProductService = {
    // dumpProducts: () => {
    //   return mongodbService.inSession((session) => {
    //     return mongodbService.products().find({}, null, {
    //       session,
    //     })
    //       .lean()
    //       .exec();
    //   });
    // },
    saveProduct: (doc) => {
      return mongodbService.products().create(doc);
    },
    getProductById: async (productId) => {
      return !productId ? undefined : mongodbService.products().findById(productId)
        .lean()
        .exec();
    },
    listProductsByIds: (productIds) => {
      return mongodbService.inSession((session) => {
        return mongodbService.products().find({
          _id: {
            $in: productIds,
          },
        }, null, {
          session,
        })
          .lean()
          .exec();

      });
    },
    // deleteProduct: async (productId) => {
    //   return mongodbService.inSession((session) => {
    //     return session.withTransaction(async () => {
    //       await mongodbService.products().deleteOne({
    //         _id: productId,
    //       }, {
    //         session,
    //       })
    //         .exec();
    //       await mongodbService.transactions().updateMany({
    //         product: productId,
    //       }, {
    //         $unset: {
    //           product: 1,
    //         },
    //       }, {
    //         session,
    //       })
    //         .exec();
    //     });
    //   });
    // },
    // updateProduct: (doc) => {
    //   return mongodbService.products().replaceOne({
    //     _id: doc._id,
    //   }, doc, {
    //     runValidators: true,
    //   })
    //     .exec();
    // },
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
