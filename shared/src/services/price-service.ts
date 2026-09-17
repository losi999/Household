import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';

export interface IPriceService {
  savePrice(doc: Documents.Price): Promise<Documents.Price>;
  savePrices(...docs: Documents.Price[]): Promise<unknown>;
  findPriceById(priceId: Api.Price.Id): Promise<Documents.Price>;
  deletePrice(priceId: Api.Price.Id): Promise<unknown>;
  updatePrice(priceId: Api.Price.Id, updateQuery: DocumentUpdate<Documents.Price>): Promise<unknown>;
  listPrices(): Promise<Documents.Price[]>;
  findPricesByIds(priceIds: Api.Price.Id[]): Promise<Documents.Price[]>;
}

export const priceServiceFactory = (mongodbService: IMongodbService): IPriceService => {
  return {
    savePrice: async(doc) => {
      const [price] = await mongodbService.prices(async(model, session) => {
        try {
          return await model.create([doc], {
            session,
          });
        } catch (error) {
          if (error.code !== 11000) { 
            throw error;
          }
  
          const { _id, ...restOfDoc } = doc;
          
          const res = await model.findOneAndReplace({
            ...error.keyValue,
            isArchived: true,
          }, restOfDoc).session(session);
  
          if (!res) {
            throw error;
          }
  
          return [res];
        }
      });
      return price;
    },
    savePrices: (...docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.prices.insertMany(docs, {
          session,
        });
      });
    },
    findPriceById: async (priceId) => {
      if (priceId) {
        return mongodbService.prices((model, session) => {
          return model.findById(priceId)
            .session(session)
            .lean();
        });       
      }
    },
    deletePrice: async (priceId) => {
      return mongodbService.inTransaction(async (models, session) => {
        const [
          customers,
          entries,
        ] = await Promise.all([
          models.customers.find({
            'jobs.prices.price': priceId,
          }).session(session),
          models.calendarEntries.find({
            'prices.price': priceId,
          }).session(session),
        ]);

        if (customers.length === 0 && entries.length === 0) {
          await models.prices.findByIdAndDelete(priceId, {
            session,
          });           
        } else {
          await models.prices.findByIdAndUpdate(priceId, {
            isArchived: true,
          }, {
            session,
          });
        }
      });
    },
    updatePrice: async (priceId, { update, arrayFilters }) => {
      return mongodbService.prices((model, session) => {
        return model.findByIdAndUpdate(priceId, update, {
          arrayFilters,
          runValidators: true,
          session,
        });
      });
    },
    listPrices: () => {
      return mongodbService.prices((model, session) => {
        return model.find({
          isArchived: false,
        }).session(session)
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean();
      });
    },
    findPricesByIds: async (priceIds) => {
      if (!priceIds?.length) {
        return [];
      }
      
      return mongodbService.prices((model, session) => {
        return model.find({
          _id: {
            $in: priceIds,
          },
        }).session(session)
          .lean();
      });
    },
  };
};
