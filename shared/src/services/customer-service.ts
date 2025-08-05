import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Customer } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ICustomerService {
  dumpCustomers(): Promise<Customer.Document[]>;
  saveCustomer(doc: Customer.Document): Promise<Customer.Document>;
  saveCustomers(docs: Customer.Document[]): Promise<unknown>;
  findCustomerById(customerId: Customer.Id): Promise<Customer.Document>;
  // deleteCustomer(customerId: Customer.Id): Promise<unknown>;
  updateCustomer(customerId: Customer.Id, updateQuery: UpdateQuery<Customer.Document>): Promise<unknown>;
  listCustomers(): Promise<Customer.Document[]>;
  // findCustomersByIds(customerIds: Customer.Id[]): Promise<Customer.Document[]>;
  // mergeCustomers(ctx: {
  //   targetCustomerId: Customer.Id;
  //   sourceCustomerIds: Customer.Id[];
  // }): Promise<unknown>;
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
    // deleteCustomer: async (customerId) => {
    //   return mongodbService.inSession((session) => {
    //     return session.withTransaction(async () => {
    //       await mongodbService.customers.deleteOne({
    //         _id: customerId,
    //       }, {
    //         session,
    //       });
            
    //       await mongodbService.transactions.updateMany({
    //         customer: customerId,
    //       }, {
    //         $unset: {
    //           customer: 1,
    //         },
    //       }, {
    //         session,
    //       });
            
    //     });
    //   });
    // },
    updateCustomer: async (customerId, updateQuery) => {
      return mongodbService.customers.findByIdAndUpdate(customerId, updateQuery, {
        runValidators: true,
      });
    },
    listCustomers: () => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.customers.find({}).session(session)
          .collation({
            locale: 'hu',
          })
          .sort('name')
          .lean();
          
      });
    },
    // findCustomersByIds: (customerIds) => {
    //   return mongodbService.inSession(async (session) => {
    //     return mongodbService.customers.find({
    //       _id: {
    //         $in: customerIds,
    //       },
    //     }).session(session)
    //       .lean();
          
    //   });
    // },
    //   mergeCustomers: ({ targetCustomerId, sourceCustomerIds }) => {
    //     console.log(sourceCustomerIds);
    //     return mongodbService.inSession((session) => {
    //       return session.withTransaction(async () => {
    //         await mongodbService.customers.deleteMany({
    //           _id: {
    //             $in: sourceCustomerIds,
    //           },
    //         }, {
    //           session,
    //         });

    //         await mongodbService.transactions.updateMany({
    //           customer: {
    //             $in: sourceCustomerIds,
    //           },
    //         }, {
    //           $set: {
    //             customer: targetCustomerId,
    //           },
    //         }, {
    //           runValidators: true,
    //           session,
    //         });

  //       });
  //     });
  //   },
  };

  return instance;
};
