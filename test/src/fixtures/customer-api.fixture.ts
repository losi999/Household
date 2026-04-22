import { hasPriceId, isPriceBase } from '@household/shared/common/type-guards';
import { getCustomerId, getPriceId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Customer, Price } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type CustomerApiFixture = {
  requestCreateCustomer(customer: Customer.Request): Promise<APIResponse>;
  requestUpdateCustomer(customerId: Customer.Id, customer: Customer.Request): Promise<APIResponse>;
  requestGetCustomer(customerId: Customer.Id): Promise<APIResponse>;
  requestListCustomers(): Promise<APIResponse>;
  requestListCustomerWorks(customerId: Customer.Id): Promise<APIResponse>;
  requestCreateCustomerJob(customerId: Customer.Id, job: Customer.Job.Request): Promise<APIResponse>;
  requestUpdateCustomerJob(customerId: Customer.Id, jobName: Customer.Job.Name['name'], job: Customer.Job.Request): Promise<APIResponse>;
  requestDeleteCustomerJob(customerId: Customer.Id, jobName: Customer.Job.Name['name']): Promise<APIResponse>;
  requestAddCustomerToBlacklist(body: Customer.Id[]): Promise<APIResponse>;
  requestRemoveCustomerFromBlacklist(body: Customer.Id[]): Promise<APIResponse>;
};

export const test = baseTest.extend<CustomerApiFixture>({
  requestCreateCustomer: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCustomer = async (customer: Customer.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/customer/v1/customers`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: customer,
      });
    };

    await use(requestCreateCustomer);
  },
  requestUpdateCustomer: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCustomer = async (customerId: Customer.Id, customer: Customer.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/customer/v1/customers/${customerId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: customer,
      });
    };

    await use(requestUpdateCustomer);
  },
  requestGetCustomer: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCustomer = async (customerId: Customer.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/customer/v1/customers/${customerId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetCustomer);
  },
  requestListCustomers: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCustomers = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/customer/v1/customers`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListCustomers);
  },
  requestListCustomerWorks: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCustomerWorks = async (customerId: Customer.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/works`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListCustomerWorks);
  },
  requestCreateCustomerJob: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCustomerJob = async (customerId: Customer.Id, job: Customer.Job.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/jobs`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: job,
      });
    };

    await use(requestCreateCustomerJob);
  },
  requestUpdateCustomerJob: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCustomerJob = async (customerId: Customer.Id, jobName: Customer.Job.Name['name'], job: Customer.Job.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/jobs/${jobName}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: job,
      });
    };

    await use(requestUpdateCustomerJob);
  },
  requestDeleteCustomerJob: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCustomerJob = async (customerId: Customer.Id, jobName: Customer.Job.Name['name']) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/jobs/${jobName}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
      });
    };

    await use(requestDeleteCustomerJob);
  },
  requestAddCustomerToBlacklist: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestAddCustomerToBlacklist = async (body: Customer.Id[]) => {
      return loggedRequest.put(`${process.env.BASE_URL}/customer/v1/customers/blacklist`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: body,
      });
    };

    await use(requestAddCustomerToBlacklist);
  },
  requestRemoveCustomerFromBlacklist: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestRemoveCustomerFromBlacklist = async (body: Customer.Id[]) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/customer/v1/customers/blacklist`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: body,
      });
    };

    await use(requestRemoveCustomerFromBlacklist);
  },
});

export const validateCustomerJobPriceResponse = (priceResponses: (Price.Response & Customer.Job.Quantity)[], priceDocuments: Customer.Job.Document['prices']) => {
  return priceResponses.map((priceResponse, index) => {
    const priceDocument = priceDocuments[index];

    if (isPriceBase(priceDocument)) {
      return new Comparer(priceResponse, {
        name: priceDocument.name,
        amount: priceDocument.amount,
      });
    }

    return new Comparer(priceResponse, {
      name: priceDocument.price.name,
      amount: priceDocument.price.amount,
      unitOfMeasurement: priceDocument.price.unitOfMeasurement,
      priceId: getPriceId(priceDocument.price),
      quantity: priceDocument.quantity,
    });
  });
};

const validateCustomerResponseBase = (response: Customer.ResponseBase, document: Customer.Document) => {
  return new Comparer(response, {
    customerId: getCustomerId(document),
    name: document.name,
    description: document.description,
    isGroup: document.isGroup,
    rating: document.rating,
  });
};

export const validateCustomerResponse = (response: Customer.Response, document: Customer.Document) => {
  return new Comparer(response, [
    validateCustomerResponseBase(response, document),
    {
      blacklistedCustomers: response.blacklistedCustomers.map((blacklistedCustomer, index) => {
        const doc = document.blacklistedCustomers[index];

        return validateCustomerResponseBase(blacklistedCustomer, doc);
      }),
      jobs: response.jobs.map((job, index) => {
        const jobDocument = document.jobs[index];

        return new Comparer(job, {
          name: jobDocument.name,
          description: jobDocument.description,
          duration: jobDocument.duration,
          prices: validateCustomerJobPriceResponse(job.prices, jobDocument.prices), 
        });
      }),
    },
  ]);
};

const compareCustomerBaseProperties = (actual: Customer.Document, expected: Customer.Document | Customer.Request) => {
  return new Comparer(actual, {
    name: expected.name,
    description: expected.description,
    isGroup: expected.isGroup,
    rating: expected.rating,
  });
};

const compareCustomerBlacklists = (actual: Customer.Document, expectedBlacklistedCustomers: Customer.Document[]) => {
  return new Comparer(actual, {
    blacklistedCustomers: expectedBlacklistedCustomers.map((blacklistedCustomer) => {
      return getCustomerId(blacklistedCustomer);
    }),
  });
};

const compareCustomerJobs = (actual: Customer.Document, expectedCustomerJobs: Customer.Job.Document[], request?: Customer.Job.Request, jobName?: Customer.Job.Name['name']) => { 
  return new Comparer(actual, {
    jobs: actual.jobs.map((actualJob, index) => {
      const expectedJob = expectedCustomerJobs[index] && expectedCustomerJobs[index].name !== jobName ? expectedCustomerJobs[index] : request;

      return new Comparer(actualJob, {
        name: expectedJob.name,
        description: expectedJob.description,
        duration: expectedJob.duration,
        prices: actualJob.prices.map((actualPrice, priceIndex) => {
          const expectedPrice = expectedJob.prices[priceIndex];

          if (isPriceBase(actualPrice) && isPriceBase(expectedPrice)) {
            return new Comparer(actualPrice, {
              name: expectedPrice.name,
              amount: expectedPrice.amount,
            });
          } 

          if (!isPriceBase(actualPrice) && !isPriceBase(expectedPrice)) {
            return new Comparer(actualPrice, {
              price: hasPriceId(expectedPrice) ? expectedPrice.priceId : getPriceId(expectedPrice.price),
              quantity: expectedPrice.quantity,
            });
          } 
        }),
      });
    }),
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsCustomerDocument(req: Customer.Request, currentDocument: Customer.Document, originalDocument?: Customer.Document) {
    if (!currentDocument) {
      return {
        pass: false,
        message: () => 'expected customer to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, req),
      compareCustomerBlacklists(currentDocument, originalDocument?.blacklistedCustomers ?? []),
      compareCustomerJobs(currentDocument, originalDocument?.jobs ?? []),
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  async toMatchCustomerDocument(received: APIResponse, document: Customer.Document) {
    const response = await received.json() as Customer.Response;
  
    const errors = validateCustomerResponse(response, document).validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match customer document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingCustomerDocument(received: APIResponse, document: Customer.Document) {
    const response = await received.json() as Customer.Response[];
  
    const matchingResponse = response.find(r => r.customerId === getCustomerId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a customer with id ${getCustomerId(document)}, but it was not found`,
      };
    }
  
    const errors = validateCustomerResponse(matchingResponse, document).validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match customer document, but it did not:\n${errors.join('\n')}`,
    };
  }, 
  toHaveBeenAddedToBlacklist(blacklistedCustomer: Customer.Document, originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, [
        ...originalDocument.blacklistedCustomers,
        blacklistedCustomer,
      ]),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be added to blacklist, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenRemovedFromBlacklist(blacklistedCustomer: Customer.Document, originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers.filter(c => getCustomerId(c) !== getCustomerId(blacklistedCustomer))),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be removed from blacklist, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenAddedToCustomerJobs(req: Customer.Job.Request, originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs, req),
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer job to be added, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenRemovedFromCustomerJobs(jobName: Customer.Job.Request['name'], originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs.filter(j => j.name !== jobName)),
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer job to be removed, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenUpdatedInCustomerJobs(req: Customer.Job.Request, jobName: Customer.Job.Request['name'], originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs, req, jobName),
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer job to be updated, but it was not:\n${errors.join('\n')}`,
    };
  },
});
