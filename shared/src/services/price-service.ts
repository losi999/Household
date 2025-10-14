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
    savePrice: (doc) => {
      return mongodbService.prices.create(doc).catch(async (error) => {
        if (error.code !== 11000) { 
          throw error;
        }

        const { _id, ...restOfDoc } = doc;
        
        const res = await mongodbService.prices.findOneAndReplace({
          ...error.keyValue,
          isArchived: true,
        }, restOfDoc);

        if (!res) {
          throw error;
        }

        return res;
      });
    },
    savePrices: (docs) => {
      return mongodbService.inSession((session) => {
        return mongodbService.prices.insertMany(docs, {
          session,
        });
      });
    },
    findPriceById: async (priceId) => {
      return !priceId ? undefined : mongodbService.prices.findById(priceId)
        .lean();
        
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
      return mongodbService.prices.findByIdAndUpdate(priceId, update, {
        arrayFilters,
        runValidators: true,
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
      return priceIds?.length > 0 ? mongodbService.inSession((session) => {
        return mongodbService.prices.find({
          _id: {
            $in: priceIds,
          },
        }).session(session)
          .lean();
      }) : [];
    },
  };
};
