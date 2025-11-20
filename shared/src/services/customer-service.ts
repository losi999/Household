import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

export interface ICustomerService {
  saveCustomer(doc: Customer.Document): Promise<Customer.Document>;
  saveCustomers(docs: Customer.Document[]): Promise<unknown>;
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
      const [customer] = await mongodbService.inSession((session) => {
        return mongodbService.customers.create([doc], {
          session,
        });
      });
      
      return customer;
    },
    saveCustomers: (docs) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(() => {
          return mongodbService.customers.insertMany(docs, {
            session,
          });
        });
      });
    },
    findCustomerById: async (customerId) => {
      if (customerId) {
        return mongodbService.inSession((session) => {
          return mongodbService.customers.findById(customerId)
            .session(session)
            .lean();
        });
      }        
    },
    getCustomerById: async (customerId) => {
      if (customerId) {
        return mongodbService.inSession((session) => {
          return mongodbService.customers.findById(customerId)
            .session(session)
            .populate('jobs.prices.price')
            .populate('blacklistedCustomers')
            .lean();
        });
      }        
    },
    updateCustomers: async (ctx) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          return Promise.all(ctx.map(({ customerId, update: { update, arrayFilters } }) => {
            return mongodbService.customers.findByIdAndUpdate(customerId, update, {
              arrayFilters,
              runValidators: true,
              session,
            });
          }));
        });
      });
    },
    updateCustomer: async (customerId, { update, arrayFilters }) => {
      return mongodbService.inSession((session) => {
        return mongodbService.customers.findByIdAndUpdate(customerId, update, {
          arrayFilters,
          runValidators: true,
          session,
        });
      });
    },
    listCustomers: () => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.customers.find({}).session(session)
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
      
      return mongodbService.inSession((session) => {
        return mongodbService.customers.find({
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
