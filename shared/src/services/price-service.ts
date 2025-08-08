import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';

export interface IPriceService {
  dumpPrices(): Promise<Price.Document[]>;
  savePrice(doc: Price.Document): Promise<Price.Document>;
  savePrices(docs: Price.Document[]): Promise<unknown>;
  findPriceById(priceId: Price.Id): Promise<Price.Document>;
  deletePrice(priceId: Price.Id): Promise<unknown>;
  updatePrice(priceId: Price.Id, updateQuery: DocumentUpdate<Price.Document>): Promise<unknown>;
  listPrices(): Promise<Price.Document[]>;
}

export const priceServiceFactory = (mongodbService: IMongodbService): IPriceService => {
  return {
    dumpPrices: () => {
      return mongodbService.inSession((session) => {
        return mongodbService.prices.find({}).session(session)
          .lean();
          
      });
    },
    savePrice: (doc) => {
      return mongodbService.prices.create(doc);
    },
    savePrices: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.prices.insertMany(docs, {
            session,
          });
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
          await mongodbService.prices.deleteOne({
            _id: priceId,
          }, {
            session,
          });            
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
        return mongodbService.prices.find({}).session(session)
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean();
          
      });
    },
  };
};
