import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Category, Product } from '@household/shared/types/types';

export interface IProductService {
  dumpProducts(): Promise<Product.Document[]>;
  saveProduct(ctx: {document: Product.Document } & Category.Id): Promise<Product.Document>;
  getProductById(productId: Product.IdType): Promise<Product.Document>;
  listProductsByIds(productIds: Product.IdType[]): Promise<Product.Document[]>;
  deleteProduct(productId: Product.IdType): Promise<unknown>;
  updateProduct(doc: Product.Document): Promise<unknown>;
  // listProducts(): Promise<Product.Document[]>;
}

export const productServiceFactory = (mongodbService: IMongodbService): IProductService => {

  const instance: IProductService = {
    dumpProducts: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.products().find({}, null, {
          session,
        })
          .lean()
          .exec();
      });
    },
    saveProduct: async ({ categoryId, document }) => {
      let product: Product.Document;
      await mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          product = await mongodbService.products().create(document);
          console.log(document, categoryId);
          return mongodbService.categories().updateOne({
            _id: categoryId,
          }, {
            $push: {
              products: product,
            },
          });
        });
      });
      return product;
    },
    getProductById: async (productId) => {
      return !productId ? null : mongodbService.products().findById(productId)
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
    deleteProduct: async (productId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          await mongodbService.products().deleteOne({
            _id: productId,
          }, {
            session,
          })
            .exec();
          //TODO
          // await mongodbService.transactions().updateMany({
          //   product: productId,
          // }, {
          //   $unset: {
          //     product: 1,
          //   },
          // }, {
          //   session,
          // })
          //   .exec();
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
