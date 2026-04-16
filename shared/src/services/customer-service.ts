import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

export interface ICustomerService {
  saveCustomer(doc: Customer.Document): Promise<Customer.Document>;
  saveCustomers(...docs: Customer.Document[]): Promise<unknown>;
  findCustomerById(customerId: Customer.Id): Promise<Customer.Document>;
  getCustomerById(customerId: Customer.Id): Promise<Customer.Document>;
  updateCustomer(customerId: Customer.Id, update: DocumentUpdate<Customer.Document>): Promise<unknown>;
  updateCustomers(ctx: {customerId: Customer.Id; update: DocumentUpdate<Customer.Document>}[]): Promise<unknown>;
  listCustomers(): Promise<Customer.Document[]>;
  findCustomersByIds(customerIds: Customer.Id[]): Promise<Customer.Document[]>;
}

export const customerServiceFactory = (mongodbService: IMongodbService): ICustomerService => {

  const instance: ICustomerService = {
    saveCustomer: async (doc) => {
      const [customer] = await mongodbService.customers((model, session) => {
        return model.create([doc], {
          session,
        });
      });
      
      return customer;
    },
    saveCustomers: (docs) => {
      return mongodbService.inTransaction((models, session) => {
        return models.customers.insertMany(docs, {
          session,
        });
      });
    },
    findCustomerById: async (customerId) => {
      if (customerId) {
        return mongodbService.customers((model, session) => {
          return model.findById(customerId)
            .session(session)
            .lean();
        });
      }        
    },
    getCustomerById: async (customerId) => {
      if (customerId) {
        return mongodbService.customers((model, session) => {
          return model.findById(customerId)
            .session(session)
            .populate('jobs.prices.price')
            .populate('blacklistedCustomers')
            .lean();
        });
      }        
    },
    updateCustomers: async (ctx) => {
      return mongodbService.inTransaction(async (models, session) => {
        return Promise.all(ctx.map(({ customerId, update: { update, arrayFilters } }) => {
          return models.customers.findByIdAndUpdate(customerId, update, {
            arrayFilters,
            runValidators: true,
            session,
          });
        }));
      });
    },
    updateCustomer: async (customerId, { update, arrayFilters }) => {
      return mongodbService.customers((model, session) => {
        return model.findByIdAndUpdate(customerId, update, {
          arrayFilters,
          runValidators: true,
          session,
        });
      });
    },
    listCustomers: () => {
      return mongodbService.customers((model, session) => {
        return model.find({}).session(session)
          .populate('jobs.prices.price')
          .populate('blacklistedCustomers')
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean();
      });
    },
    findCustomersByIds: async (customerIds) => {
      if (!customerIds?.length) { 
        return [];
      }
      
      return mongodbService.customers((model, session) => {
        return model.find({
          _id: {
            $in: customerIds,
          },
        }).session(session)
          .lean();          
      });
    },
  };

  return instance;
};
