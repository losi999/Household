import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Types } from 'mongoose';
import { ProductType } from '@household/shared/enums';

export interface IProductService {
  saveProduct(doc: Documents.Product): Promise<Documents.Product>;
  saveProducts(...docs: Documents.Product[]): Promise<unknown>;
  findProductById(productId: Api.Product.Id): Promise<Documents.Product>;
  listProductsByParentId(parentProductId: Api.Product.Id): Promise<Documents.Product[]>;
  listProductsByIds(productIds: Api.Product.Id[]): Promise<Documents.Product[]>;
  deleteProduct(productId: Api.Product.Id): Promise<unknown>;
  updateProduct(productId: Api.Product.Id, updateQuery: DocumentUpdate<Documents.Product>): Promise<unknown>;
  mergeProducts(ctx: {
    targetProductId: Api.Product.Id;
    sourceProductIds: Api.Product.Id[];
  } & Api.Product.ProductType<ProductType>): Promise<unknown>;
  listProducts(): Promise<Documents.Product[]>;
}

export const productServiceFactory = (mongodbService: IMongodbService): IProductService => {

  const instance: IProductService = {
    listProducts: () => {
      return mongodbService.products((model, session) => {
        return model.find({})
          .session(session)
          .sort({
            productType: 1,
            name: 1,
          })
          .lean()
          .collation({
            locale: 'hu',
          });
      });
    },
    listProductsByParentId: (parentProductId) => {
      const parent = new Types.ObjectId(parentProductId);

      console.log(parent);
      return mongodbService.products((model, session) => {
        return model.find({
          $or: [
            {
              genericProduct: parentProductId,
            },
            {
              specificProduct: parentProductId,
            },
          ],
        }).session(session)
          .lean();
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
    mergeProducts: ({ targetProductId, sourceProductIds, productType }) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.products.deleteMany({
          _id: {
            $in: sourceProductIds,
          },
        }, {
          session,
        });

        switch(productType) {
          case ProductType.Generic: {
            await models.products.updateMany({
              genericProduct: {
                $in: sourceProductIds,
              },
            }, {
              $set: {
                genericProduct: targetProductId,
              },
            }, {
              session,
            });
            break;
          }
          case ProductType.Specific: {
            await models.products.updateMany({
              specificProduct: {
                $in: sourceProductIds,
              },
            }, {
              $set: {
                specificProduct: targetProductId,
              },
            }, {
              session,
            });
            break;
          }
        }

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
