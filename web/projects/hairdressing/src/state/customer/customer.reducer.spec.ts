// import { testDataFactory } from '@household/shared/common/test-data-factory';
// import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
// import { customerReducer, CustomerState } from '@household/web/app/hairdressing/customer/state/customer.reducer';

// describe('Customer reducer', () => {
//   let initialState: CustomerState;

//   beforeEach(() => {
//     initialState = {};
//   });

//   it('should return the default state when an unknown action is used', () => {
//     const action = {
//       type: 'Unknown', 
//     } as any;
//     const state = customerReducer(initialState, action);
//     expect(state).toBe(initialState);
//   });

//   describe('On List customers completed', () => {
//     it('should set customer list', () => {
//       const customerResponse = testDataFactory.customer.response();
//       const action = customerApiActions.listCustomersCompleted({
//         customers: [customerResponse],
//       });
  
//       const state = customerReducer(initialState, action);
//       expect(state).toEqual({
//         customerList: [jasmine.objectContaining(customerResponse)],
//       });
//     });
//   });

//   describe('On Create customer completed', () => {
//     it('should create customer', () => {
//       const existingCustomer = testDataFactory.customer.response({
//         name: 'Z customer',
//       });
  
//       initialState = {
//         customerList: [existingCustomer],
//       };
  
//       const customerId = testDataFactory.customer.id();
//       const request = testDataFactory.customer.request({
//         name: 'A customer',
//       });
        
//       const action = customerApiActions.createCustomerCompleted({
//         ...request,
//         customerId,
//       });
//       const state = customerReducer(initialState, action);
//       expect(state).toEqual({
//         customerList: [
//           jasmine.objectContaining(
//             {
//               customerId,
//               ...request,
//               jobs: [],
//               blacklistedCustomers: [],
//             },
//           ),
//           existingCustomer,
//         ],
//       });
//     });
//   });
  
//   describe('On Update customer completed', () => {
//     it('should update customer', () => {
//       const customerId = testDataFactory.customer.id();
//       const existingCustomer = testDataFactory.customer.response({
//         name: 'Z customer',
//       });
//       const originalCustomer = testDataFactory.customer.response({
//         customerId,
//       });
  
//       initialState = {
//         customerList: [
//           existingCustomer,
//           originalCustomer,
//         ],
//       };
//       const request = testDataFactory.customer.request({
//         name: 'A customer',
//       });
        
//       const action = customerApiActions.updateCustomerCompleted({
//         ...request,
//         customerId,
//       });

//       const state = customerReducer(initialState, action);

//       expect(state).toEqual({
//         customerList: [
//           jasmine.objectContaining(
//             {
//               ...originalCustomer,
//               customerId,
//               ...request,
//             }),
//           existingCustomer,
//         ],
//       });
//     });
//   });
  
//   describe('On Create customer job completed', () => {
//     it('should update customer with new job', () => {
//       const existingCustomer = testDataFactory.customer.response();
//       const customerId = testDataFactory.customer.id();
//       const existingJob = testDataFactory.customer.job.response({
//         name: 'Z job',
//       });
//       const originalCustomer = testDataFactory.customer.response({
//         customerId,
//         jobs: [existingJob],
//       });

//       initialState = {
//         customerList: [
//           existingCustomer,
//           originalCustomer,
//         ],
//       };

//       const listedPrice = testDataFactory.price.response();
//       const customPriceName = 'custom price name';
//       const request = testDataFactory.customer.job.request({
//         body: {
//           name: 'A job',
//         },
//         prices: {
//           custom: [
//             {
//               name: customPriceName,
//             },
//           ],
//           listed: [
//             {
//               priceId: listedPrice.priceId,
//             },
//           ],
//         },
//       });
        
//       const action = customerApiActions.createCustomerJobCompleted({
//         ...request,
//         customerId,
//         priceList: [listedPrice],
//       });
      
//       const state = customerReducer(initialState, action);
      
//       expect(state).toEqual({
//         customerList: [
//           existingCustomer,
//           {
//             ...originalCustomer,
//             jobs: [
//               {
//                 name: request.name,
//                 description: request.description,
//                 duration: request.duration,
//                 prices: [
//                   jasmine.objectContaining({
//                     name: customPriceName,
//                   }),
//                   jasmine.objectContaining(listedPrice),
//                 ],
//               },
//               existingJob,
//             ],
//           },
//         ],
//       });
//     });
//   });
  
//   describe('On Update customer job completed', () => {
//     it('should update customer job', () => {
//       const existingCustomer = testDataFactory.customer.response();
//       const customerId = testDataFactory.customer.id();
//       const existingJob = testDataFactory.customer.job.response({
//         name: 'Z job',
//       });
//       const jobToUpdate = testDataFactory.customer.job.response();
//       const originalCustomer = testDataFactory.customer.response({
//         customerId,
//         jobs: [
//           existingJob,
//           jobToUpdate,
//         ],
//       });

//       initialState = {
//         customerList: [
//           existingCustomer,
//           originalCustomer,
//         ],
//       };

//       const priceResponse = testDataFactory.price.response();
//       const customPriceName = 'custom price name';
//       const request = testDataFactory.customer.job.request({
//         body: {
//           name: 'A job',
//         },
//         prices: {
//           custom: [
//             {
//               name: customPriceName,
//             },
//           ],
//           listed: [
//             {
//               priceId: priceResponse.priceId,
//             },
//           ],
//         },
//       });
//       const jobName = jobToUpdate.name;
        
//       const action = customerApiActions.updateCustomerJobCompleted({
//         ...request,
//         customerId,
//         jobName,
//         priceList: [priceResponse],
//       });
      
//       const state = customerReducer(initialState, action);
      
//       expect(state).toEqual({
//         customerList: [
//           existingCustomer,
//           {
//             ...originalCustomer,
//             jobs: [
//               {
//                 name: request.name,
//                 description: request.description,
//                 duration: request.duration,
//                 prices: [
//                   jasmine.objectContaining({
//                     name: customPriceName,
//                   }),
//                   jasmine.objectContaining(priceResponse),
//                 ],
//               },
//               existingJob,
//             ],
//           },
//         ],
//       });
//     });
//   });
  
//   describe('On Delete customer job completed', () => {
//     it('should delete customer job', () => {
//       const existingCustomer = testDataFactory.customer.response();
//       const customerId = testDataFactory.customer.id();
//       const existingJob = testDataFactory.customer.job.response();
//       const jobToDelete = testDataFactory.customer.job.response();
//       const originalCustomer = testDataFactory.customer.response({
//         customerId,
//         jobs: [
//           jobToDelete,
//           existingJob,
//         ],
//       });

//       initialState = {
//         customerList: [
//           existingCustomer,
//           originalCustomer,
//         ],
//       };

//       const jobName = jobToDelete.name;
        
//       const action = customerApiActions.deleteCustomerJobCompleted({
//         customerId,
//         jobName,
//       });
      
//       const state = customerReducer(initialState, action);
      
//       expect(state).toEqual({
//         customerList: [
//           existingCustomer,
//           {
//             ...originalCustomer,
//             jobs: [existingJob],
//           },
//         ],
//       });
//     });
//   });
  
//   describe('On Add customer to blacklist completed', () => {
//     it('should add customers to each others blacklist', () => {
//       const existingCustomer = testDataFactory.customer.response();
//       const customerA = testDataFactory.customer.response();
//       const customerB = testDataFactory.customer.response();

//       initialState = {
//         customerList: [
//           existingCustomer,
//           customerA,
//           customerB,
//         ],
//       };
        
//       const action = customerApiActions.addCustomerToBlacklistCompleted({
//         customers: [
//           customerA,
//           customerB,
//         ],
//       });
      
//       const state = customerReducer(initialState, action);
      
//       expect(state).toEqual({
//         customerList: [
//           existingCustomer,
//           {
//             ...customerA,
//             blacklistedCustomers: [customerB],
//           },
//           {
//             ...customerB,
//             blacklistedCustomers: [customerA],
//           },
//         ],
//       });
//     });
//   });
  
//   describe('On Remove customer from blacklist completed', () => {
//     it('should remove customers from each others blacklist', () => {
//       const existingCustomer = testDataFactory.customer.response();
//       const customerA = testDataFactory.customer.response();
//       const customerB = testDataFactory.customer.response();
//       customerA.blacklistedCustomers = [customerB];
//       customerB.blacklistedCustomers = [customerA];

//       initialState = {
//         customerList: [
//           existingCustomer,
//           customerA,
//           customerB,
//         ],
//       };
        
//       const action = customerApiActions.deleteCustomerFromBlacklistCompleted({
//         customerIds: [
//           customerA.customerId,
//           customerB.customerId,
//         ],
//       });
      
//       const state = customerReducer(initialState, action);
      
//       expect(state).toEqual({
//         customerList: [
//           existingCustomer,
//           {
//             ...customerA,
//             blacklistedCustomers: [],
//           },
//           {
//             ...customerB,
//             blacklistedCustomers: [],
//           },
//         ],
//       });
//     });
//   });

//   describe('On List customer works completed', () => {
//     it('should set customer works', () => {
//       const existingCustomerId = testDataFactory.customer.id();
//       const existingWork = testDataFactory.calendar.entry.response.workBase();
//       const customerId = testDataFactory.customer.id();
//       const work = testDataFactory.calendar.entry.response.workBase();

//       initialState = {
//         customerWorks: {
//           [existingCustomerId]: [existingWork],
//         },
//       };

//       const action = customerApiActions.listCustomerWorksCompleted({
//         customerId,
//         works: [work],
//       });
  
//       const state = customerReducer(initialState, action);
//       expect(state).toEqual({
//         customerWorks: {
//           [existingCustomerId]: [existingWork],
//           [customerId]: [work],
//         },
//       });
//     });
//   });
// });
