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
