import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';

export interface IPriceService {
  savePrice(doc: Price.Document): Promise<Price.Document>;
  savePrices(docs: Price.Document[]): Promise<unknown>;
  findPriceById(priceId: Price.Id): Promise<Price.Document>;
  deletePrice(priceId: Price.Id): Promise<unknown>;
  updatePrice(priceId: Price.Id, updateQuery: DocumentUpdate<Price.Document>): Promise<unknown>;
  listPrices(): Promise<Price.Document[]>;
  findPricesByIds(priceIds: Price.Id[]): Promise<Price.Document[]>;
}

export const priceServiceFactory = (mongodbService: IMongodbService): IPriceService => {
  return {
    savePrice: async(doc) => {
      const [price] = await mongodbService.inSession((session) => {
        return mongodbService.prices.create([doc], {
          session,
        }).catch(async (error) => {
          if (error.code !== 11000) { 
            throw error;
          }

          const { _id, ...restOfDoc } = doc;
        
          const res = await mongodbService.prices.findOneAndReplace({
            ...error.keyValue,
            isArchived: true,
          }, restOfDoc).session(session);

          if (!res) {
            throw error;
          }

          return [res];
        });
      });
      return price;
    },
    savePrices: (docs) => {
      return mongodbService.inSession((session) => {
        return mongodbService.prices.insertMany(docs, {
          session,
        });
      });
    },
    findPriceById: async (priceId) => {
      if (priceId) {
        return mongodbService.inSession((session) => {
          return mongodbService.prices.findById(priceId)
            .session(session)
            .lean();
        });       
      }
    },
    deletePrice: async (priceId) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const [
            customers,
            entries,
          ] = await Promise.all([
            mongodbService.customers.find({
              'jobs.prices.price': priceId,
            }).session(session),
            mongodbService.calendarEntries.find({
              'prices.price': priceId,
            }).session(session),
          ]);

          if (customers.length === 0 && entries.length === 0) {
            await mongodbService.prices.findByIdAndDelete(priceId, {
              session,
            });           
          } else {
            await mongodbService.prices.findByIdAndUpdate(priceId, {
              isArchived: true,
            }, {
              session,
            });
          }
        });
      });
    },
    updatePrice: async (priceId, { update, arrayFilters }) => {
      return mongodbService.inSession((session) => {
        return mongodbService.prices.findByIdAndUpdate(priceId, update, {
          arrayFilters,
          runValidators: true,
          session,
        });
      });
    },
    listPrices: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.prices.find({
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
      
      return mongodbService.inSession((session) => {
        return mongodbService.prices.find({
          _id: {
            $in: priceIds,
          },
        }).session(session)
          .lean();
      });
    },
  };
};
