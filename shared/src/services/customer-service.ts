import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

export interface ICustomerService {
  dumpCustomers(): Promise<Customer.Document[]>;
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
    dumpCustomers: () => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.customers.find({}).session(session)
          .lean();
          
      });
    },
    saveCustomer: async (doc) => {
      return mongodbService.customers.create(doc);
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
      return !customerId ? undefined : mongodbService.customers.findById(customerId)
        .lean();
        
    },
    getCustomerById: async (customerId) => {
      return !customerId ? undefined : mongodbService.customers.findById(customerId)
        .populate('jobs.prices.price')
        .populate('blacklistedCustomers')
        .lean();
        
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
      return mongodbService.customers.findByIdAndUpdate(customerId, update, {
        arrayFilters,
        runValidators: true,
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
      return customerIds?.length ? mongodbService.inSession((session) => {
        return mongodbService.customers.find({
          _id: {
            $in: customerIds,
          },
        }).session(session)
          .lean();
          
      }) : undefined;
    },
  };

  return instance;
};
