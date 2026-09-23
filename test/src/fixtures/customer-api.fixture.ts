import { hasPriceId } from '@household/shared/common/type-guards';
import { getCustomerId, getPriceId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Comparer } from '@household/test/comparer';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type CustomerApiFixture = {
  requestCreateCustomer(customer: Requests.Customer): Promise<APIResponse>;
  requestUpdateCustomer(customerId: Api.Customer.Id, customer: Requests.Customer): Promise<APIResponse>;
  requestDeleteCustomer(customerId: Api.Customer.Id): Promise<APIResponse>;
  requestGetCustomer(customerId: Api.Customer.Id): Promise<APIResponse>;
  requestListCustomers(): Promise<APIResponse>;
  requestListCustomerWorks(customerId: Api.Customer.Id): Promise<APIResponse>;
  requestCreateCustomerJob(customerId: Api.Customer.Id, job: Requests.CustomerJob): Promise<APIResponse>;
  requestUpdateCustomerJob(customerId: Api.Customer.Id, jobName: Api.Customer.Job.Name['name'], job: Requests.CustomerJob): Promise<APIResponse>;
  requestDeleteCustomerJob(customerId: Api.Customer.Id, jobName: Api.Customer.Job.Name['name']): Promise<APIResponse>;
  requestAddCustomerToBlacklist(body: Api.Customer.Id[]): Promise<APIResponse>;
  requestRemoveCustomerFromBlacklist(body: Api.Customer.Id[]): Promise<APIResponse>;
};

export const test = baseTest.extend<CustomerApiFixture>({
  requestCreateCustomer: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCustomer = async (customer: Requests.Customer) => {
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

    const requestUpdateCustomer = async (customerId: Api.Customer.Id, customer: Requests.Customer) => {
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
  requestDeleteCustomer: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCustomer = async (customerId: Api.Customer.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/customer/v1/customers/${customerId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteCustomer);
  },
  requestGetCustomer: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCustomer = async (customerId: Api.Customer.Id) => {
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

    const requestListCustomerWorks = async (customerId: Api.Customer.Id) => {
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

    const requestCreateCustomerJob = async (customerId: Api.Customer.Id, job: Requests.CustomerJob) => {
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

    const requestUpdateCustomerJob = async (customerId: Api.Customer.Id, jobName: Api.Customer.Job.Name['name'], job: Requests.CustomerJob) => {
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

    const requestDeleteCustomerJob = async (customerId: Api.Customer.Id, jobName: Api.Customer.Job.Name['name']) => {
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

    const requestAddCustomerToBlacklist = async (body: Api.Customer.Id[]) => {
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

    const requestRemoveCustomerFromBlacklist = async (body: Api.Customer.Id[]) => {
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

export const validateCustomerJobPriceResponse = (priceResponses: (Responses.Price & Api.Customer.Job.Quantity)[], priceDocuments: Documents.CustomerJob['prices']) => {
  return priceResponses.map((priceResponse, index) => {
    const priceDocument = priceDocuments[index];

    return new Comparer(priceResponse, {
      name: priceDocument.price.name,
      amount: priceDocument.price.amount,
      unitOfMeasurement: priceDocument.price.unitOfMeasurement,
      priceId: getPriceId(priceDocument.price),
      quantity: priceDocument.quantity,
    });
  });
};

const validateCustomerResponseBase = (response: Responses.CustomerLean, document: Documents.Customer) => {
  return new Comparer(response, {
    customerId: getCustomerId(document),
    name: document.name,
    description: document.description,
    isGroup: document.isGroup,
    rating: document.rating,
  });
};

export const validateCustomerResponse = (response: Responses.Customer, document: Documents.Customer) => {
  return new Comparer(response, [
    validateCustomerResponseBase(response, document),
    {
      isArchived: document.isArchived ?? false,
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
          additionalPrice: jobDocument.additionalPrice,
          title: document.isGroup ? jobDocument.name : `${document.name}: ${jobDocument.name}`,
          prices: validateCustomerJobPriceResponse(job.prices, jobDocument.prices), 
        });
      }),
    },
  ]);
};

const compareCustomerBaseProperties = (actual: Documents.Customer, expected: Documents.Customer | Requests.Customer) => {
  return new Comparer(actual, {
    name: expected.name,
    description: expected.description,
    isGroup: expected.isGroup,
    rating: expected.rating,
  });
};

const compareCustomerBlacklists = (actual: Documents.Customer, expectedBlacklistedCustomers: Documents.Customer[]) => {
  return new Comparer(actual, {
    blacklistedCustomers: expectedBlacklistedCustomers.map((blacklistedCustomer) => {
      return getCustomerId(blacklistedCustomer);
    }),
  });
};

const compareCustomerJobs = (actual: Documents.Customer, expectedCustomerJobs: Documents.CustomerJob[], request?: Requests.CustomerJob, jobName?: Api.Customer.Job.Name['name']) => { 
  return new Comparer(actual, {
    jobs: actual.jobs.map((actualJob, index) => {
      const expectedJob = expectedCustomerJobs[index] && expectedCustomerJobs[index].name !== jobName ? expectedCustomerJobs[index] : request;

      return new Comparer(actualJob, {
        name: expectedJob.name,
        description: expectedJob.description,
        duration: expectedJob.duration,
        additionalPrice: expectedJob.additionalPrice,
        prices: actualJob.prices.map((actualPrice, priceIndex) => {
          const expectedPrice = expectedJob.prices[priceIndex];

          return new Comparer(actualPrice, {
            price: hasPriceId(expectedPrice) ? expectedPrice.priceId : getPriceId(expectedPrice.price),
            quantity: expectedPrice.quantity,
          });
        }),
      });
    }),
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsCustomerDocument(req: Requests.Customer, currentDocument: Documents.Customer, originalDocument?: Documents.Customer) {
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
      {
        isArchived: originalDocument?.isArchived ?? false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },

  toHaveBeenDeletedFromDatabase(document: Documents.Customer) {
    return {
      pass: !document,
      message: () => `Expected customer to be deleted from database, but it was found with id ${getCustomerId(document)}`,
    };
  },
  async toMatchCustomerDocument(received: APIResponse, document: Documents.Customer) {
    const response = await received.json() as Responses.Customer;
  
    const errors = validateCustomerResponse(response, document).validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match customer document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingCustomerDocument(received: APIResponse, document: Documents.Customer) {
    const response = await received.json() as Responses.Customer[];
  
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
  toHaveBeenRenamed(originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
      {
        name: `${originalDocument?.name} (Régi vendég)`,
        isArchived: true,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be renamed, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenArchived(originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
      {
        isArchived: true,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be archived, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenActivated(originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
      {
        isArchived: false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be activated, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenAddedToBlacklist(blacklistedCustomer: Documents.Customer, originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, [
        ...originalDocument.blacklistedCustomers,
        blacklistedCustomer,
      ]),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
      {
        isArchived: originalDocument?.isArchived ?? false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be added to blacklist, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenRemovedFromBlacklist(blacklistedCustomer: Documents.Customer, originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers.filter(c => getCustomerId(c) !== getCustomerId(blacklistedCustomer))),
      compareCustomerJobs(currentDocument, originalDocument.jobs),
      {
        isArchived: originalDocument?.isArchived ?? false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer to be removed from blacklist, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenAddedToCustomerJobs(req: Requests.CustomerJob, originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs, req),
      {
        isArchived: originalDocument?.isArchived ?? false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer job to be added, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenRemovedFromCustomerJobs(jobName: Requests.CustomerJob['name'], originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs.filter(j => j.name !== jobName)),
      {
        isArchived: originalDocument?.isArchived ?? false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer job to be removed, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenUpdatedInCustomerJobs(req: Requests.CustomerJob, jobName: Requests.CustomerJob['name'], originalDocument: Documents.Customer, currentDocument: Documents.Customer) {
    const comparer = new Comparer(currentDocument, [
      compareCustomerBaseProperties(currentDocument, originalDocument),
      compareCustomerBlacklists(currentDocument, originalDocument.blacklistedCustomers),
      compareCustomerJobs(currentDocument, originalDocument.jobs, req, jobName),
      {
        isArchived: originalDocument?.isArchived ?? false,
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected customer job to be updated, but it was not:\n${errors.join('\n')}`,
    };
  },
});
