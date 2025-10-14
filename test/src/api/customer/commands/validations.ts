import { Customer } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getCustomerId, getPriceId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { isListedPrice, isPriceBase } from '@household/shared/common/type-guards';

const validateUnchangedCustomerBase = (actual: Customer.Base, expected: Customer.Base) => {
  expect(actual.name, 'name').to.equal(expected.name);
  expect(actual.description, 'description').to.equal(expected.description);
  expect(actual.isGroup, 'isGroup').to.equal(expected.isGroup);
  expect(actual.rating, 'rating').to.equal(expected.rating);
};

const validateUnchangedBlacklistedCustomers = (actual: Customer.Document[], expected: Customer.Document[], affectedBlacklistedCustomerId?: Customer.Id) => {
  const act = affectedBlacklistedCustomerId ? actual.filter(a => getCustomerId(a) !== affectedBlacklistedCustomerId) : actual;
  const exp = affectedBlacklistedCustomerId ? expected.filter(a => getCustomerId(a) !== affectedBlacklistedCustomerId) : expected;

  expect(act.length, 'number of blacklisted customers not affected').to.equal(exp.length);
  act.forEach((a) => {
    const customerId = getCustomerId(a);
    const e = exp.find(x => getCustomerId(x) === customerId);
    expect(e, `customer ${customerId} is still blacklisted`).to.not.be.undefined;
  });
};

const validateUnchangedCustomerJobs = (actual: Customer.Job.Document[], expected: Customer.Job.Document[]) => {
  expect(actual.length, 'number of customer jobs').to.equal(expected.length);
  actual.forEach(({ name, description, duration, prices, ...empty }) => {
    const exp = expected.find(e => name === e.name);
    
    expect(name, 'job.name').to.equal(exp.name);
    expect(description, 'job.description').to.equal(exp.description);
    expect(duration, 'job.duration').to.equal(exp.duration);
    expect(prices.length, 'job.prices.length').to.equal(exp.prices.length);
    for (let i = 0; i < prices.length; i += 1) {
      const actualJobPrice = prices[i];
      const expectJobPrice = exp.prices[i];

      if (isPriceBase(actualJobPrice)) {
        if (isPriceBase(expectJobPrice)) {
          expect(actualJobPrice.name, 'job.prices.name').to.equal(expectJobPrice.name);
          expect(actualJobPrice.amount, 'job.prices.amount').to.equal(expectJobPrice.amount);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      } else {
        if (!isPriceBase(expectJobPrice)) {
          expect(getPriceId(actualJobPrice.price), 'job.prices.priceId').to.equal(getPriceId(expectJobPrice.price));
          expect(actualJobPrice.quantity, 'job.prices.quantity').to.equal(expectJobPrice.quantity);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      }
    }
    expectEmptyObject(empty);
  });
};

const validateCustomerDocument = (response: Customer.CustomerId, request: Customer.Request, originalDocument?: Pick<Customer.Document, 'blacklistedCustomers' | 'jobs'>) => {
  const id = response?.customerId;

  cy.log('Get customer document', id)
    .findCustomerDocumentById(id)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(id);
      const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
    
      expect(name, 'name').to.equal(request.name);
      expect(description, 'description').to.equal(request.description);
      expect(isGroup, 'isGroup').to.equal(request.isGroup);
      expect(rating, 'rating').to.equal(request.rating);
      validateUnchangedCustomerJobs(jobs, originalDocument?.jobs ?? []);
      validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument?.blacklistedCustomers ?? []);
      expectRemainingProperties(internal);
    });
};

const validateCustomerJobCreated = (originalDocument: Customer.Document, jobRequest: Customer.Job.Request) => {
  const customerId = getCustomerId(originalDocument);

  cy.log('Get customer document', customerId)
    .findCustomerDocumentById(customerId)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(customerId);
      const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
      const createdJob = jobs.pop();

      validateUnchangedCustomerBase(document, originalDocument);
      validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers);
      validateUnchangedCustomerJobs(jobs, originalDocument.jobs);

      expect(createdJob.name, 'job.name').to.equal(jobRequest.name);
      expect(createdJob.description, 'job.description').to.equal(jobRequest.description);
      expect(createdJob.duration, 'job.duration').to.equal(jobRequest.duration);
      expect(createdJob.prices.length, 'job.prices.length').to.equal(jobRequest.prices.length);
      for (let i = 0; i < createdJob.prices.length; i += 1) {
        const jobPriceDocument = createdJob.prices[i];
        const jobPriceRequest = jobRequest.prices[i];

        if (isPriceBase(jobPriceDocument)) {
          if (isPriceBase(jobPriceRequest)) {
            expect(jobPriceDocument.name, 'job.prices.name').to.equal(jobPriceRequest.name);
            expect(jobPriceDocument.amount, 'job.prices.amount').to.equal(jobPriceRequest.amount);
          } else {
            expect(true, 'job prices do not match').to.be.false;
          }
        } else {
          if (!isPriceBase(jobPriceRequest)) {
            expect(getPriceId(jobPriceDocument.price), 'job.prices.priceId').to.equal(jobPriceRequest.priceId);
            expect(jobPriceDocument.quantity, 'job.prices.quantity').to.equal(jobPriceRequest.quantity);
          } else {
            expect(true, 'job prices do not match').to.be.false;
          }
        }
      }
      expectRemainingProperties(internal);
    });
};

const validateCustomerJobUpdated = (originalDocument: Customer.Document, jobName: string, jobRequest: Customer.Job.Request) => {
  const customerId = getCustomerId(originalDocument);

  cy.log('Get customer document', customerId)
    .findCustomerDocumentById(customerId)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(customerId);
      const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;

      validateUnchangedCustomerBase(document, originalDocument);
      validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers);
      validateUnchangedCustomerJobs(jobs.filter(j => j.name !== jobRequest.name), originalDocument.jobs.filter(j => j.name !== jobName));
      
      const updatedJob = jobs.find(j => j.name === jobRequest.name);
      expect(updatedJob.name, 'job.name').to.equal(jobRequest.name);
      expect(updatedJob.description, 'job.description').to.equal(jobRequest.description);
      expect(updatedJob.duration, 'job.duration').to.equal(jobRequest.duration);
      expect(updatedJob.prices.length, 'job.prices.length').to.equal(jobRequest.prices.length);
      for (let i = 0; i < updatedJob.prices.length; i += 1) {
        const jobPriceDocument = updatedJob.prices[i];
        const jobPriceRequest = jobRequest.prices[i];

        if (isPriceBase(jobPriceDocument)) {
          if (isPriceBase(jobPriceRequest)) {
            expect(jobPriceDocument.name, 'job.prices.name').to.equal(jobPriceRequest.name);
            expect(jobPriceDocument.amount, 'job.prices.amount').to.equal(jobPriceRequest.amount);
          } else {
            expect(true, 'job prices do not match').to.be.false;
          }
        } else {
          if (!isPriceBase(jobPriceRequest)) {
            expect(getPriceId(jobPriceDocument.price), 'job.prices.priceId').to.equal(jobPriceRequest.priceId);
            expect(jobPriceDocument.quantity, 'job.prices.quantity').to.equal(jobPriceRequest.quantity);
          } else {
            expect(true, 'job prices do not match').to.be.false;
          }
        }
      }
      expectRemainingProperties(internal);
    });
};

const validateCustomerJobDeleted = (originalDocument: Customer.Document, jobName: string) => {
  const customerId = getCustomerId(originalDocument);

  cy.log('Get customer document', customerId)
    .findCustomerDocumentById(customerId)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(customerId);
      const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;

      validateUnchangedCustomerBase(document, originalDocument);
      validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers);
      validateUnchangedCustomerJobs(jobs, originalDocument.jobs.filter(j => j.name !== jobName));
      
      const deletedJob = jobs.find(j => j.name === jobName);
      expect(deletedJob, 'job has been deleted').to.be.undefined;
      expectRemainingProperties(internal);
    });
};

const validateCustomerAddedToBlacklist = (originalDocument: Customer.Document, blacklistedCustomer: Customer.Document) => {
  const customerId = getCustomerId(originalDocument);

  cy.log('Get customer document', customerId)
    .findCustomerDocumentById(customerId)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(customerId);
      const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
      
      validateUnchangedCustomerBase(document, originalDocument);
      validateUnchangedCustomerJobs(jobs, originalDocument.jobs);
      validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers, getCustomerId(blacklistedCustomer));
      
      const addedBlacklistedCustomer = blacklistedCustomers.find(c => getCustomerId(c) === getCustomerId(blacklistedCustomer));
      expect(addedBlacklistedCustomer, `customer ${customerId} is added to blacklist`).to.not.be.undefined;

      expectRemainingProperties(internal);
    });
};

const validateCustomerRemovedFromBlacklist = (originalDocument: Customer.Document, blacklistedCustomer: Customer.Document) => {
  const customerId = getCustomerId(originalDocument);

  cy.log('Get customer document', customerId)
    .findCustomerDocumentById(customerId)
    .should((document) => {
      expect(getCustomerId(document), '_id').to.equal(customerId);
      const { name, description, isGroup, rating, blacklistedCustomers, jobs, ...internal } = document;
      
      validateUnchangedCustomerBase(document, originalDocument);
      validateUnchangedCustomerJobs(jobs, originalDocument.jobs);
      validateUnchangedBlacklistedCustomers(blacklistedCustomers, originalDocument.blacklistedCustomers, getCustomerId(blacklistedCustomer));
      
      const removedBlacklistedCustomer = blacklistedCustomers.find(c => getCustomerId(c) === getCustomerId(blacklistedCustomer));
      expect(removedBlacklistedCustomer, `customer ${customerId} is removed to blacklist`).to.be.undefined;

      expectRemainingProperties(internal);
    });
};

const validateCustomerResponse = (response: Customer.Response, document: Customer.Document) => {
  const { customerId, name, blacklistedCustomers, description, isGroup, jobs, rating, workEntries, ...empty } = response;

  expect(customerId, 'customerId').to.equal(getCustomerId(document));
  expect(name, 'name').to.equal(document.name);
  expect(description, 'description').to.equal(document.description);
  expect(isGroup, 'isGroup').to.equal(document.isGroup);
  expect(rating, 'rating').to.equal(document.rating);
  expect(blacklistedCustomers.length, 'number of blacklisted customers').to.equal(document.blacklistedCustomers.length);
  blacklistedCustomers.forEach((blacklistedCustomerResponse) => {
    const blacklistedCustomerDocument = document.blacklistedCustomers.find(c => getCustomerId(c) === blacklistedCustomerResponse.customerId);

    expect(blacklistedCustomerResponse.customerId, 'blacklistedCustomers.customerId').to.equal(getCustomerId(blacklistedCustomerDocument));
    expect(blacklistedCustomerResponse.name, 'blacklistedCustomers.name').to.equal(blacklistedCustomerDocument.name);
    expect(blacklistedCustomerResponse.description, 'blacklistedCustomers.description').to.equal(blacklistedCustomerDocument.description);
    expect(blacklistedCustomerResponse.isGroup, 'blacklistedCustomers.isGroup').to.equal(blacklistedCustomerDocument.isGroup);
    expect(blacklistedCustomerResponse.rating, 'blacklistedCustomers.rating').to.equal(blacklistedCustomerDocument.rating);
  });

  expect(jobs.length, 'number of customer jobs').to.equal(document.jobs.length);
  jobs.forEach((jobResponse) => {
    const jobDocument = document.jobs.find(j => j.name === jobResponse.name);

    expect(jobResponse.name, 'job.name').to.equal(jobDocument.name);
    expect(jobResponse.description, 'job.description').to.equal(jobDocument.description);
    expect(jobResponse.duration, 'job.duration').to.equal(jobDocument.duration);
    expect(jobResponse.prices.length, 'job.prices.length').to.equal(jobDocument.prices.length);
    for (let i = 0; i < jobResponse.prices.length; i += 1) {
      const jobPriceResponse = jobResponse.prices[i];
      const jobPriceDocument = jobDocument.prices[i];

      if (isListedPrice(jobPriceResponse)) {
        if (!isPriceBase(jobPriceDocument)) {
          expect(jobPriceResponse.priceId, `job.prices[${i}].priceId`).to.equal(getPriceId(jobPriceDocument.price));
          expect(jobPriceResponse.name, `job.prices[${i}].name`).to.equal(jobPriceDocument.price.name);
          expect(jobPriceResponse.amount, `job.prices[${i}].amount`).to.equal(jobPriceDocument.price.amount);
          expect(jobPriceResponse.unitOfMeasurement, `job.prices[${i}].unitOfMeasurement`).to.equal(jobPriceDocument.price.unitOfMeasurement);
          expect(jobPriceResponse.quantity, `job.prices[${i}].quantity`).to.equal(jobPriceDocument.quantity);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      } else {
        if (isPriceBase(jobPriceDocument)) {
          expect(jobPriceResponse.name, `job.prices[${i}].name`).to.equal(jobPriceDocument.name);
          expect(jobPriceResponse.amount, `job.prices[${i}].name`).to.equal(jobPriceDocument.amount);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      }
    }
  });

  //TODO work entries
  expectEmptyObject(empty);
};

const validateInCustomerListResponse = (responses: Customer.Response[], document: Customer.Document) => {
  const response = responses.find(r => r.customerId === getCustomerId(document));
  validateCustomerResponse(response, document);
  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

export const setCustomerValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateCustomerDocument,
    validateCustomerResponse,
    validateInCustomerListResponse,
  });
  
  Cypress.Commands.addAll({
    validateCustomerJobCreated,
    validateCustomerJobUpdated,
    validateCustomerJobDeleted,
    validateCustomerAddedToBlacklist,
    validateCustomerRemovedFromBlacklist,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCustomerJobCreated: CommandFunction<typeof validateCustomerJobCreated>;
      validateCustomerJobUpdated: CommandFunction<typeof validateCustomerJobUpdated>;
      validateCustomerJobDeleted: CommandFunction<typeof validateCustomerJobDeleted>;
      validateCustomerAddedToBlacklist: CommandFunction<typeof validateCustomerAddedToBlacklist>;
      validateCustomerRemovedFromBlacklist: CommandFunction<typeof validateCustomerRemovedFromBlacklist>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCustomerDocument: CommandFunctionWithPreviousSubject<typeof validateCustomerDocument>;
      validateCustomerResponse: CommandFunctionWithPreviousSubject<typeof validateCustomerResponse>;
      validateInCustomerListResponse: CommandFunctionWithPreviousSubject<typeof validateInCustomerListResponse>;
    }
  }
}
