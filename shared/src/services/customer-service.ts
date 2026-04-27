import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

export interface ICustomerService {
  saveCustomer(doc: Customer.Document): Promise<Customer.Document>;
  saveCustomers(...docs: Customer.Document[]): Promise<unknown>;
  findCustomerById(customerId: Customer.Id): Promise<Customer.Document>;
  deleteCustomer(customerId: Customer.Id): Promise<unknown>;
  getCustomerById(customerId: Customer.Id): Promise<Customer.Document>;
  updateCustomer(customerId: Customer.Id, update: DocumentUpdate<Customer.Document>): Promise<unknown>;
  updateCustomers(ctx: {customerId: Customer.Id; update: DocumentUpdate<Customer.Document>}[]): Promise<unknown>;
  listCustomers(): Promise<Customer.Document[]>;
  findCustomersByIds(customerIds: Customer.Id[]): Promise<Customer.Document[]>;
}

export const customerServiceFactory = (mongodbService: IMongodbService): ICustomerService => {

  const instance: ICustomerService = {
    saveCustomer: async (doc) => {
      const [customer] = await mongodbService.customers(async (model, session) => {
        try {
          return await model.create([doc], {
            session,
          });
        } catch (error) {
          if (error.code !== 11000) { 
            throw error;
          }

          const name = error.keyValue.name;

          const res = await model.findOneAndUpdate({
            isArchived: true,
            name,
          }, {
            $set: {
              name: `${name} (Régi vendég)`,
            },
          }, {
            session,
          });

          if (!res) {
            throw error;
          }

          return model.create([doc], {
            session,
          });
        }
      });
        
      return customer;
    },
    saveCustomers: (...docs) => {
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
    deleteCustomer: async (customerId) => {
      return mongodbService.inTransaction(async ({ calendarEntries, customers }, session) => {
        const entries = await calendarEntries.find({
          customer: customerId,
        }).session(session);

        if (entries.length === 0) {
          await customers.findByIdAndDelete(customerId, {
            session,
          });           

          await customers.updateMany({
            blacklistedCustomers: customerId,
          }, {
            $pull: {
              blacklistedCustomers: customerId,
            },
          }, {
            session,
          });

        } else {
          await customers.findByIdAndUpdate(customerId, {
            isArchived: true,
          }, {
            session,
          });
        }
      });
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
