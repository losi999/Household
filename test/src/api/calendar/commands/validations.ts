import { Calendar, Customer, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getAccountId, getCalendarEntryId, getCategoryId, getCustomerId, getPriceId, getTransactionId, timeSlotToTimeString } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { isListedPrice, isPriceBase } from '@household/shared/common/type-guards';
import { CalendarDayType, CalendarEntryType, PaymentType, SettingKey, TransactionType } from '@household/shared/enums';
import { default as moment } from 'moment-timezone';

// const validateUnchangedCustomerBase = (actual: Customer.Base, expected: Customer.Base) => {
//   expect(actual.name, 'name').to.equal(expected.name);
//   expect(actual.description, 'description').to.equal(expected.description);
//   expect(actual.isGroup, 'isGroup').to.equal(expected.isGroup);
//   expect(actual.rating, 'rating').to.equal(expected.rating);
// };

// const validateUnchangedBlacklistedCustomers = (actual: Customer.Document[], expected: Customer.Document[], affectedBlacklistedCustomerId?: Customer.Id) => {
//   const act = affectedBlacklistedCustomerId ? actual.filter(a => getCustomerId(a) !== affectedBlacklistedCustomerId) : actual;
//   const exp = affectedBlacklistedCustomerId ? expected.filter(a => getCustomerId(a) !== affectedBlacklistedCustomerId) : expected;

//   expect(act.length, 'number of blacklisted customers not affected').to.equal(exp.length);
//   act.forEach((a) => {
//     const customerId = getCustomerId(a);
//     const e = exp.find(x => getCustomerId(x) === customerId);
//     expect(e, `customer ${customerId} is still blacklisted`).to.not.be.undefined;
//   });
// };

// const validateUnchangedCustomerJobs = (actual: Customer.Job.Document[], expected: Customer.Job.Document[]) => {
//   expect(actual.length, 'number of customer jobs').to.equal(expected.length);
//   actual.forEach(({ name, description, duration, prices, ...empty }) => {
//     const exp = expected.find(e => name === e.name);
    
//     expect(name, 'job.name').to.equal(exp.name);
//     expect(description, 'job.description').to.equal(exp.description);
//     expect(duration, 'job.duration').to.equal(exp.duration);
//     expect(prices.length, 'job.prices.length').to.equal(exp.prices.length);
//     for (let i = 0; i < prices.length; i += 1) {
//       const actualJobPrice = prices[i];
//       const expectJobPrice = exp.prices[i];

//       if (isPriceBase(actualJobPrice)) {
//         if (isPriceBase(expectJobPrice)) {
//           expect(actualJobPrice.name, 'job.prices.name').to.equal(expectJobPrice.name);
//           expect(actualJobPrice.amount, 'job.prices.amount').to.equal(expectJobPrice.amount);
//         } else {
//           expect(true, 'job prices do not match').to.be.false;
//         }
//       } else {
//         if (!isPriceBase(expectJobPrice)) {
//           expect(getPriceId(actualJobPrice.price), 'job.prices.priceId').to.equal(getPriceId(expectJobPrice.price));
//           expect(actualJobPrice.quantity, 'job.prices.quantity').to.equal(expectJobPrice.quantity);
//         } else {
//           expect(true, 'job prices do not match').to.be.false;
//         }
//       }
//     }
//     expectEmptyObject(empty);
//   });
// };

// const validateCustomerDocument = (response: Customer.CustomerId, request: Customer.Request, originalDocument?: Pick<Customer.Document, 'blacklistedCustomers' | 'jobs'>) => {
//   const id = response?.customerId;

//   cy.log('Get customer document', id)
//     .findCustomerDocumentById(id)
//     .should((document) => {
//       expect(getCustomerId(document), '_id').to.equal(id);
//       const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
    
//       expect(name, 'name').to.equal(request.name);
//       expect(description, 'description').to.equal(request.description);
//       expect(isGroup, 'isGroup').to.equal(request.isGroup);
//       expect(rating, 'rating').to.equal(request.rating);
//       validateUnchangedCustomerJobs(jobs, originalDocument?.jobs ?? []);
//       validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument?.blacklistedCustomers ?? []);
//       expectRemainingProperties(internal);
//     });
// };

// const validateCustomerJobCreated = (originalDocument: Customer.Document, jobRequest: Customer.Job.Request) => {
//   const customerId = getCustomerId(originalDocument);

//   cy.log('Get customer document', customerId)
//     .findCustomerDocumentById(customerId)
//     .should((document) => {
//       expect(getCustomerId(document), '_id').to.equal(customerId);
//       const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
//       const createdJob = jobs.pop();

//       validateUnchangedCustomerBase(document, originalDocument);
//       validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers);
//       validateUnchangedCustomerJobs(jobs, originalDocument.jobs);

//       expect(createdJob.name, 'job.name').to.equal(jobRequest.name);
//       expect(createdJob.description, 'job.description').to.equal(jobRequest.description);
//       expect(createdJob.duration, 'job.duration').to.equal(jobRequest.duration);
//       expect(createdJob.prices.length, 'job.prices.length').to.equal(jobRequest.prices.length);
//       for (let i = 0; i < createdJob.prices.length; i += 1) {
//         const jobPriceDocument = createdJob.prices[i];
//         const jobPriceRequest = jobRequest.prices[i];

//         if (isPriceBase(jobPriceDocument)) {
//           if (isPriceBase(jobPriceRequest)) {
//             expect(jobPriceDocument.name, 'job.prices.name').to.equal(jobPriceRequest.name);
//             expect(jobPriceDocument.amount, 'job.prices.amount').to.equal(jobPriceRequest.amount);
//           } else {
//             expect(true, 'job prices do not match').to.be.false;
//           }
//         } else {
//           if (!isPriceBase(jobPriceRequest)) {
//             expect(getPriceId(jobPriceDocument.price), 'job.prices.priceId').to.equal(jobPriceRequest.priceId);
//             expect(jobPriceDocument.quantity, 'job.prices.quantity').to.equal(jobPriceRequest.quantity);
//           } else {
//             expect(true, 'job prices do not match').to.be.false;
//           }
//         }
//       }
//       expectRemainingProperties(internal);
//     });
// };

// const validateCustomerJobUpdated = (originalDocument: Customer.Document, jobName: string, jobRequest: Customer.Job.Request) => {
//   const customerId = getCustomerId(originalDocument);

//   cy.log('Get customer document', customerId)
//     .findCustomerDocumentById(customerId)
//     .should((document) => {
//       expect(getCustomerId(document), '_id').to.equal(customerId);
//       const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;

//       validateUnchangedCustomerBase(document, originalDocument);
//       validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers);
//       validateUnchangedCustomerJobs(jobs.filter(j => j.name !== jobRequest.name), originalDocument.jobs.filter(j => j.name !== jobName));
      
//       const updatedJob = jobs.find(j => j.name === jobRequest.name);
//       expect(updatedJob.name, 'job.name').to.equal(jobRequest.name);
//       expect(updatedJob.description, 'job.description').to.equal(jobRequest.description);
//       expect(updatedJob.duration, 'job.duration').to.equal(jobRequest.duration);
//       expect(updatedJob.prices.length, 'job.prices.length').to.equal(jobRequest.prices.length);
//       for (let i = 0; i < updatedJob.prices.length; i += 1) {
//         const jobPriceDocument = updatedJob.prices[i];
//         const jobPriceRequest = jobRequest.prices[i];

//         if (isPriceBase(jobPriceDocument)) {
//           if (isPriceBase(jobPriceRequest)) {
//             expect(jobPriceDocument.name, 'job.prices.name').to.equal(jobPriceRequest.name);
//             expect(jobPriceDocument.amount, 'job.prices.amount').to.equal(jobPriceRequest.amount);
//           } else {
//             expect(true, 'job prices do not match').to.be.false;
//           }
//         } else {
//           if (!isPriceBase(jobPriceRequest)) {
//             expect(getPriceId(jobPriceDocument.price), 'job.prices.priceId').to.equal(jobPriceRequest.priceId);
//             expect(jobPriceDocument.quantity, 'job.prices.quantity').to.equal(jobPriceRequest.quantity);
//           } else {
//             expect(true, 'job prices do not match').to.be.false;
//           }
//         }
//       }
//       expectRemainingProperties(internal);
//     });
// };

// const validateCustomerJobDeleted = (originalDocument: Customer.Document, jobName: string) => {
//   const customerId = getCustomerId(originalDocument);

//   cy.log('Get customer document', customerId)
//     .findCustomerDocumentById(customerId)
//     .should((document) => {
//       expect(getCustomerId(document), '_id').to.equal(customerId);
//       const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;

//       validateUnchangedCustomerBase(document, originalDocument);
//       validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers);
//       validateUnchangedCustomerJobs(jobs, originalDocument.jobs.filter(j => j.name !== jobName));
      
//       const deletedJob = jobs.find(j => j.name === jobName);
//       expect(deletedJob, 'job has been deleted').to.be.undefined;
//       expectRemainingProperties(internal);
//     });
// };

// const validateCustomerAddedToBlacklist = (originalDocument: Customer.Document, blacklistedCustomer: Customer.Document) => {
//   const customerId = getCustomerId(originalDocument);

//   cy.log('Get customer document', customerId)
//     .findCustomerDocumentById(customerId)
//     .should((document) => {
//       expect(getCustomerId(document), '_id').to.equal(customerId);
//       const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
      
//       validateUnchangedCustomerBase(document, originalDocument);
//       validateUnchangedCustomerJobs(jobs, originalDocument.jobs);
//       validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers, getCustomerId(blacklistedCustomer));
      
//       const addedBlacklistedCustomer = blacklistedCustomers.find(c => getCustomerId(c) === getCustomerId(blacklistedCustomer));
//       expect(addedBlacklistedCustomer, `customer ${customerId} is added to blacklist`).to.not.be.undefined;

//       expectRemainingProperties(internal);
//     });
// };

// const validateCustomerRemovedFromBlacklist = (originalDocument: Customer.Document, blacklistedCustomer: Customer.Document) => {
//   const customerId = getCustomerId(originalDocument);

//   cy.log('Get customer document', customerId)
//     .findCustomerDocumentById(customerId)
//     .should((document) => {
//       expect(getCustomerId(document), '_id').to.equal(customerId);
//       const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
      
//       validateUnchangedCustomerBase(document, originalDocument);
//       validateUnchangedCustomerJobs(jobs, originalDocument.jobs);
//       validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers, getCustomerId(blacklistedCustomer));
      
//       const removedBlacklistedCustomer = blacklistedCustomers.find(c => getCustomerId(c) === getCustomerId(blacklistedCustomer));
//       expect(removedBlacklistedCustomer, `customer ${customerId} is removed to blacklist`).to.be.undefined;

//       expectRemainingProperties(internal);
//     });
// };

const validateCalendarEntryResponseBase = ({ calendarEntryId, day, description, end, start, title }: Calendar.Entry.ResponseBase, document: Calendar.Entry.Document) => {
  expect(calendarEntryId, 'calendarEntryId').to.equal(getCalendarEntryId(document));
  expect(day, 'day').to.equal(document.day);
  expect(description, 'description').to.equal(document.description);
  expect(end, 'end').to.equal(document.end);
  expect(start, 'start').to.equal(document.start);
  expect(title, 'title').to.equal(document.title);
};

const validateCalendarEntryResponse = (response: Calendar.Entry.Response, document: Calendar.Entry.Document) => {
  if (response.entryType === CalendarEntryType.Work) {
    const { calendarEntryId, day, description, end, entryType, start, title, customer, isPaid, prices, ...empty } = response;
    validateCalendarEntryResponseBase({
      calendarEntryId,
      day,
      description,
      end,
      start,
      title,
    }, document);
    expect(entryType, 'entryType').to.equal(document.entryType);
    expect(isPaid, 'isPaid').to.equal(document.isPaid);
    cy.validateNestedObject('customer', customer).validateCustomerResponse(document.customer);
    
    for (let i = 0; i < prices.length; i += 1) {
      const priceResponse = prices[i];
      const priceDocument = document.prices[i];

      if (isListedPrice(priceResponse)) {
        if (!isPriceBase(priceDocument)) {
          const { quantity, ...price } = priceResponse;
          expect(quantity, `prices[${i}].quantity`).to.equal(priceDocument.quantity);
          cy.validateNestedObject(`prices[${i}]`, price).validatePriceResponse(priceDocument.price);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      } else {
        if (isPriceBase(priceDocument)) {
          expect(priceResponse.name, `job.prices[${i}].name`).to.equal(priceDocument.name);
          expect(priceResponse.amount, `job.prices[${i}].name`).to.equal(priceDocument.amount);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      }
    }
    expectEmptyObject(empty);
  } else {
    const { calendarEntryId, day, description, end, entryType, start, title, ...empty } = response;
    validateCalendarEntryResponseBase({
      calendarEntryId,
      day,
      description,
      end,
      start,
      title,
    }, document);
    expect(entryType, 'entryType').to.equal(document.entryType);
    expectEmptyObject(empty);
  }
};

// const validateInCustomerListResponse = (responses: Customer.Response[], document: Customer.Document) => {
//   const response = responses.find(r => r.customerId === getCustomerId(document));
//   validateCustomerResponse(response, document);
//   return cy.wrap(responses, {
//     log: false,
//   }) as Cypress.ChainableResponseBody;
// };

const validateCalendarEntryDocument = (response: Calendar.Entry.CalendarEntryId, request: Calendar.Entry.Request) => {
  const id = response.calendarEntryId;
  cy.log('Get calendar entry document', id)
    .findCalendarEntryDocumentById(id)
    .should((document) => {
      const { customer, day, description, end, entryType, isPaid, prices, start, title, transaction, ...internal } = document;

      expect(entryType, 'entryType').to.equal(request.entryType);
      expect(day, 'day').to.equal(request.day);
      expect(start, 'start').to.equal(request.start);
      expect(end, 'end').to.equal(request.end);
      expect(title, 'title').to.equal(request.title);
      expect(description, 'description').to.equal(request.description);
      if (request.entryType === CalendarEntryType.Work) {
        expect(getCustomerId(customer), 'customer').to.equal(request.customerId);
        expect(isPaid, 'isPaid').to.be.false;
        expect(transaction, 'transaction').to.be.undefined;
        expect(prices.length, 'prices.length').to.equal(request.prices.length);
        for (let i = 0; i < prices.length; i += 1) {
          const priceDocument = prices[i];
          const priceRequest = request.prices[i];

          if (isPriceBase(priceDocument)) {
            if (isPriceBase(priceRequest)) {
              expect(priceDocument.name, `prices[${i}].name`).to.equal(priceRequest.name);
              expect(priceDocument.amount, `prices[${i}].amount`).to.equal(priceRequest.amount);
            } else {
              expect(true, `prices[${i}] do not match`).to.be.false;
            }
          } else {
            if (!isPriceBase(priceRequest)) {
              expect(getPriceId(priceDocument.price), `prices[${i}].priceId`).to.equal(priceRequest.priceId);
              expect(priceDocument.quantity, `prices[${i}].quantity`).to.equal(priceRequest.quantity);
            } else {
              expect(true, `prices[${i}] do not match`).to.be.false;
            }
          }
        }
      } else {
        expect(customer, 'customer').to.be.undefined;
        expect(prices, 'prices').to.be.undefined;
        expect(isPaid, 'isPaid').to.be.undefined;
        expect(transaction, 'transaction').to.be.undefined;
      }

      expectRemainingProperties(internal);
    });
};

const validateCalendarEntryDocumentPaid = (originalDocument: Calendar.Entry.Document, request: Calendar.Entry.PaymentRequest) => {
  const calendarEntryId = getCalendarEntryId(originalDocument);
  cy.log('Get calendar entry document', calendarEntryId)
    .findCalendarEntryDocumentById(calendarEntryId)
    .then((document) => { 
      const { transaction, isPaid, customer, day, description, end, entryType, prices, start, title, ...internal } = document;
      
      expect(day, 'day').to.equal(originalDocument.day);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(end, 'end').to.equal(originalDocument.end);
      expect(entryType, 'entryType').to.equal(originalDocument.entryType);
      expect(title, 'title').to.equal(originalDocument.title);
      expect(start, 'start').to.equal(originalDocument.start);
      expect(getCustomerId(customer), 'customer').to.equal(getCustomerId(originalDocument.customer));
      expect(prices?.length, 'prices.length').to.equal(originalDocument.prices?.length);
      for(let i = 0; i < prices?.length; i += 1) {
        const actualPrice = prices[i];
        const originalPrice = originalDocument.prices[i];

        if (isPriceBase(actualPrice)) {
          if (isPriceBase(originalPrice)) {
            expect(actualPrice.name, `prices[${i}].name`).to.equal(originalPrice.name);
            expect(actualPrice.amount, `prices[${i}].amount`).to.equal(originalPrice.amount);
          } else {
            expect(true, `prices[${i}] do not match`).to.be.false;
          }
        } else {
          if (!isPriceBase(originalPrice)) {
            expect(getPriceId(actualPrice.price), `prices[${i}].priceId`).to.equal(getPriceId(originalPrice.price));
            expect(actualPrice.quantity, `prices[${i}].quantity`).to.equal(originalPrice.quantity);
          } else {
            expect(true, `prices[${i}] do not match`).to.be.false;
          }
        }
      }
      
      expect(isPaid, 'isPaid').to.be.true;
      if (request.paymentType === PaymentType.Transfer) {
        expect(transaction, 'transaction').to.be.undefined;
      } else {
        expect(transaction, 'transaction').to.not.be.undefined;
        const transactionId = getTransactionId(transaction);

        return cy.log('Get transaction document', transactionId)
          .getTransactionDocumentById(transactionId)
          .then((transactionDocument: Transaction.PaymentDocument) => {
            const { account, amount, billingEndDate, billingStartDate, category, description, invoiceNumber, issuedAt, product, project, quantity, recipient, transactionType } = transactionDocument;
            
            const expectedIssuedAt = moment.tz(document.day, 'Europe/Budapest'); 
            expectedIssuedAt.set({
              hour: Math.floor(document.end / 4),
              minute: (document.end % 4) * 15,
            });

            expect(amount, 'amount').to.equal(request.amount);
            expect(description, 'description').to.equal(document.title);
            expect(issuedAt.toISOString(), 'issuedAt').to.equal(expectedIssuedAt.utc().toISOString());
            expect(transactionType, 'transactionType').to.equal(TransactionType.Payment);

            cy.listSettingDocumentsByKeys([
              SettingKey.HairdressingIncomeAccount,
              SettingKey.HairdressingIncomeCategory,
            ])
              .then((settings) => {
                expect(getAccountId(account), 'account').to.equal(settings.find(s => s.settingKey === SettingKey.HairdressingIncomeAccount).value);
                expect(getCategoryId(category), 'category').to.equal(settings.find(s => s.settingKey === SettingKey.HairdressingIncomeCategory).value);
              });

            expect(billingEndDate, 'billingEndDate').to.be.undefined;
            expect(billingStartDate, 'billingStartDate').to.be.undefined;
            expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
            expect(product, 'product').to.be.undefined;
            expect(project, 'project').to.be.undefined;
            expect(quantity, 'quantity').to.be.undefined;
            expect(recipient, 'recipient').to.be.undefined;            
          });
          
      }

      expectRemainingProperties(internal);
    });    
};

const validateRelatedCalendarWorkEntryUnset = (calendarEntryId: Calendar.Entry.Id) => {
  cy.log('Get calendar entry document', calendarEntryId)
    .findCalendarEntryDocumentById(calendarEntryId)
    .should((document) => {

    });
};

const validateCalendarEntryDeleted = (calendarEntryId: Calendar.Entry.Id) => {
  cy.log('Get calendar entry document', calendarEntryId)
    .findCalendarEntryDocumentById(calendarEntryId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const validateCalendarDayDocument = (requestDay: Calendar.DayProp['day'], request: Calendar.Day.Request) => {
  cy.log('Get calendar day document', requestDay)
    .findCalendarDayDocumentByDay(requestDay)
    .should((document) => {
      const { day, dayType, end, start, ...internal } = document;
      expect(day, 'day').to.equal(requestDay);
      expect(dayType, 'dayType').to.equal(request.dayType);
      if (request.dayType === CalendarDayType.Workday) {
        expect(end, 'end').to.equal(request.end);
        expect(start, 'start').to.equal(request.start);
      } else {
        expect(end, 'end').to.be.undefined;
        expect(start, 'start').to.be.undefined;
      }
      expectRemainingProperties(internal);
    });
};

const validateCalendarDayDeleted = (day: Calendar.DayProp['day']) => {
  cy.log('Get calendar day document', day)
    .findCalendarDayDocumentByDay(day)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setCalendarValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateCalendarEntryDocument,
    validateCalendarEntryResponse,
  });
  
  Cypress.Commands.addAll({
    validateCalendarDayDocument,
    validateCalendarDayDeleted,
    validateCalendarEntryDeleted,
    validateCalendarEntryDocumentPaid,
    validateRelatedCalendarWorkEntryUnset,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCalendarDayDocument: CommandFunction<typeof validateCalendarDayDocument>;
      validateCalendarDayDeleted: CommandFunction<typeof validateCalendarDayDeleted>;
      validateCalendarEntryDeleted: CommandFunction<typeof validateCalendarEntryDeleted>;
      validateCalendarEntryDocumentPaid: CommandFunction<typeof validateCalendarEntryDocumentPaid>;
      validateRelatedCalendarWorkEntryUnset: CommandFunction<typeof validateRelatedCalendarWorkEntryUnset>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCalendarEntryDocument: CommandFunctionWithPreviousSubject<typeof validateCalendarEntryDocument>;
      validateCalendarEntryResponse: CommandFunctionWithPreviousSubject<typeof validateCalendarEntryResponse>;
      // validateInCustomerListResponse: CommandFunctionWithPreviousSubject<typeof validateInCustomerListResponse>;
    }
  }
}
