import { hasPriceId, isPriceBase } from '@household/shared/common/type-guards';
import { getCustomerId, getPriceId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Customer } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { CompareResult, createComparer } from '@household/test/utils';
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
  requestCreateCustomer: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCustomer = async (customer: Customer.Request) => {
      return request.post(`${process.env.BASE_URL}/customer/v1/customers`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: customer,
      });
    };

    await use(requestCreateCustomer);
  },
  requestUpdateCustomer: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCustomer = async (customerId: Customer.Id, customer: Customer.Request) => {
      return request.put(`${process.env.BASE_URL}/customer/v1/customers/${customerId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: customer,
      });
    };

    await use(requestUpdateCustomer);
  },
  requestGetCustomer: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetCustomer = async (customerId: Customer.Id) => {
      return request.get(`${process.env.BASE_URL}/customer/v1/customers/${customerId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetCustomer);
  },
  requestListCustomers: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCustomers = async () => {
      return request.get(`${process.env.BASE_URL}/customer/v1/customers`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListCustomers);
  },
  requestListCustomerWorks: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListCustomerWorks = async (customerId: Customer.Id) => {
      return request.get(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/works`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListCustomerWorks);
  },
  requestCreateCustomerJob: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateCustomerJob = async (customerId: Customer.Id, job: Customer.Job.Request) => {
      return request.post(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/jobs`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: job,
      });
    };

    await use(requestCreateCustomerJob);
  },
  requestUpdateCustomerJob: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateCustomerJob = async (customerId: Customer.Id, jobName: Customer.Job.Name['name'], job: Customer.Job.Request) => {
      return request.put(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/jobs/${jobName}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: job,
      });
    };

    await use(requestUpdateCustomerJob);
  },
  requestDeleteCustomerJob: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteCustomerJob = async (customerId: Customer.Id, jobName: Customer.Job.Name['name']) => {
      return request.delete(`${process.env.BASE_URL}/customer/v1/customers/${customerId}/jobs/${jobName}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
      });
    };

    await use(requestDeleteCustomerJob);
  },
  requestAddCustomerToBlacklist: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestAddCustomerToBlacklist = async (body: Customer.Id[]) => {
      return request.put(`${process.env.BASE_URL}/customer/v1/customers/blacklist`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: body,
      });
    };

    await use(requestAddCustomerToBlacklist);
  },
  requestRemoveCustomerFromBlacklist: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestRemoveCustomerFromBlacklist = async (body: Customer.Id[]) => {
      return request.delete(`${process.env.BASE_URL}/customer/v1/customers/blacklist`, {
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

const validateCustomerResponse = (response: Customer.Response, document: Customer.Document): string => {
  const comparer = createComparer((compare) => {
    const blacklistedCustomers = response.blacklistedCustomers.reduce((accumulator, currentValue, index) => {
      return {
        ...accumulator,
        [`blacklistedCustomers[${index}].customerId`]: compare(currentValue.customerId, getCustomerId(document.blacklistedCustomers[index])),
        [`blacklistedCustomers[${index}].description`]: compare(currentValue.description, document.blacklistedCustomers[index].description),
        [`blacklistedCustomers[${index}].isGroup`]: compare(currentValue.isGroup, document.blacklistedCustomers[index].isGroup),
        [`blacklistedCustomers[${index}].name`]: compare(currentValue.name, document.blacklistedCustomers[index].name),
        [`blacklistedCustomers[${index}].rating`]: compare(currentValue.rating, document.blacklistedCustomers[index].rating),
      };
    }, {});

    const jobs = response.jobs.reduce((accumulator, currentValue, index) => {
      const prices = currentValue.prices.reduce((priceAccumulator, currentPrice, priceIndex) => {
        const jobPriceDocument = document.jobs[index].prices[priceIndex];

        if(isPriceBase(jobPriceDocument)) {
          return {
            ...priceAccumulator,
            [`jobs[${index}].prices[${priceIndex}].name`]: compare(currentPrice.name, jobPriceDocument.name),
            [`jobs[${index}].prices[${priceIndex}].amount`]: compare(currentPrice.amount, jobPriceDocument.amount),
          };
        } 
        return {
          ...priceAccumulator,
          [`jobs[${index}].prices[${priceIndex}].name`]: compare(currentPrice.name, jobPriceDocument.price.name),
          [`jobs[${index}].prices[${priceIndex}].amount`]: compare(currentPrice.amount, jobPriceDocument.price.amount),
          [`jobs[${index}].prices[${priceIndex}].unitOfMeasurement`]: compare(currentPrice.unitOfMeasurement, jobPriceDocument.price.unitOfMeasurement),
          [`jobs[${index}].prices[${priceIndex}].priceId`]: compare(currentPrice.priceId, getPriceId(jobPriceDocument.price)),
          [`jobs[${index}].prices[${priceIndex}].quantity`]: compare(currentPrice.quantity, jobPriceDocument.quantity),
        };
      }, {});

      return {
        ...accumulator,
        [`jobs[${index}].name`]: compare(currentValue.name, document.jobs[index].name),
        [`jobs[${index}].description`]: compare(currentValue.description, document.jobs[index].description),
        [`jobs[${index}].duration`]: compare(currentValue.duration, document.jobs[index].duration),
        ...prices,
      };
    }, {});

    return {
      customerId: compare(response.customerId, getCustomerId(document)),
      name: compare(response.name, document.name),
      description: compare(response.description, document.description),
      isGroup: compare(response.isGroup, document.isGroup),
      rating: compare(response.rating, document.rating),
      ...blacklistedCustomers,
      ...jobs,
    };
  });

  return comparer.validate(response, 'blacklistedCustomers', 'jobs');
};

const compareCustomerBaseProperties = (actual: Customer.Document, expected: Customer.Document | Customer.Request): Record<string, CompareResult<any>> => {
  return createComparer((compare) => {  
    return {
      name: compare(actual.name, expected.name),
      description: compare(actual.description, expected.description),
      isGroup: compare(actual.isGroup, expected.isGroup),
      rating: compare(actual.rating, expected.rating),
    };
  }).normalized;
};

const compareCustomerBlacklists = (actual: Customer.Document[], expected: Customer.Document[]): Record<string, CompareResult<any>> => {
  return createComparer((compare) => {
    return {
      ...actual.reduce((accumulator, currentValue, index) => {  
        return {
          ...accumulator,
          [`blacklistedCustomers[${index}]`]: compare(getCustomerId(currentValue), getCustomerId(expected[index])),
        };
      }, {}),
    };
  }).normalized;
};

const compareCustomerJobs = (actual: Customer.Job.Document[], expected: Customer.Job.Document[], request?: Customer.Job.Request, jobName?: Customer.Job.Name['name']): Record<string, CompareResult<any>> => { 
  return createComparer((compare) => {
    const jobs = actual.reduce((accumulator, currentValue, index) => {  
      const originalJob = expected[index] && expected[index].name !== jobName ? expected[index] : request;

      const prices = currentValue.prices.reduce((priceAccumulator, currentPrice, priceIndex) => {
        const originalPrice = originalJob.prices[priceIndex];

        if (isPriceBase(currentPrice) && isPriceBase(originalPrice)) {
          return {
            ...priceAccumulator,
            [`jobs[${index}].prices[${priceIndex}].name`]: compare(currentPrice.name, originalPrice.name),
            [`jobs[${index}].prices[${priceIndex}].amount`]: compare(currentPrice.amount, originalPrice.amount),
          };
        } 

        if (!isPriceBase(currentPrice) && !isPriceBase(originalPrice)) {
          return {
            ...priceAccumulator,
            [`jobs[${index}].prices[${priceIndex}].priceId`]: compare(getPriceId(currentPrice.price), hasPriceId(originalPrice) ? originalPrice.priceId : getPriceId(originalPrice.price)),
            [`jobs[${index}].prices[${priceIndex}].quantity`]: compare(currentPrice.quantity, originalPrice.quantity),
          };
        }

        return {
          ...priceAccumulator,
          [`jobs[${index}].prices[${priceIndex}].priceType`]: compare(isPriceBase(currentPrice) ? 'custom' : 'listed', isPriceBase(originalPrice) ? 'custom' : 'listed'),
        };
      }, {});

      return {  
        ...accumulator,
        [`jobs[${index}].name`]: compare(currentValue.name, originalJob.name),
        [`jobs[${index}].description`]: compare(currentValue.description, originalJob.description),
        [`jobs[${index}].duration`]: compare(currentValue.duration, originalJob.duration),
        ...prices,
      };
    }, {});

    return jobs;
  }).normalized;
};

export const expect = baseExpect.extend({
  toBeStoredInDatabase(req: Customer.Request, currentDocument: Customer.Document, originalDocument?: Customer.Document) {
    if (!currentDocument) {
      return {
        pass: false,
        message: () => 'expected customer to be stored in database, but it was not found',
      };
    }
  
    const comparer = createComparer(() => {
      return {
        ...compareCustomerBaseProperties(currentDocument, req),
        ...compareCustomerBlacklists(currentDocument.blacklistedCustomers, originalDocument?.blacklistedCustomers ?? []),
        ...compareCustomerJobs(currentDocument.jobs, originalDocument?.jobs ?? []),
      };  
    });
  
    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'blacklistedCustomers', 'jobs');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchCustomerDocument(received: APIResponse, document: Customer.Document) {
    const response = await received.json() as Customer.Response;
  
    const message = validateCustomerResponse(response, document);
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchCustomerDocumentInList(received: APIResponse, document: Customer.Document) {
    const response = await received.json() as Customer.Response[];
  
    const matchingResponse = response.find(r => r.customerId === getCustomerId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a customer with id ${getCustomerId(document)}, but it was not found`,
      };
    }
  
    const message = validateCustomerResponse(matchingResponse, document);
  
    return {
      pass: !message,
      message: () => message,
    };
  }, 
  toHaveBeenAddedToBlacklist(blacklistedCustomer: Customer.Document, originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = createComparer(() => {
      return {
        ...compareCustomerBaseProperties(currentDocument, originalDocument),
        ...compareCustomerBlacklists(currentDocument.blacklistedCustomers, [
          ...originalDocument.blacklistedCustomers,
          blacklistedCustomer,
        ]),
        ...compareCustomerJobs(currentDocument.jobs, originalDocument.jobs),
      };
    });
  
    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'blacklistedCustomers', 'jobs');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenRemovedFromBlacklist(blacklistedCustomer: Customer.Document, originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = createComparer(() => {
      return {
        ...compareCustomerBaseProperties(currentDocument, originalDocument),
        ...compareCustomerBlacklists(currentDocument.blacklistedCustomers, originalDocument.blacklistedCustomers.filter(c => getCustomerId(c) !== getCustomerId(blacklistedCustomer))),  
        ...compareCustomerJobs(currentDocument.jobs, originalDocument.jobs),
      };
    });
  
    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'blacklistedCustomers', 'jobs');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenAddedToCustomerJobs(req: Customer.Job.Request, originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = createComparer(() => {
      return {
        ...compareCustomerBaseProperties(currentDocument, originalDocument),
        ...compareCustomerBlacklists(currentDocument.blacklistedCustomers, originalDocument.blacklistedCustomers),
        ...compareCustomerJobs(currentDocument.jobs, originalDocument.jobs, req),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'blacklistedCustomers', 'jobs');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenRemovedFromCustomerJobs(jobName: Customer.Job.Request['name'], originalDocument: Customer.Document, currentDocument: Customer.Document) {
    const comparer = createComparer(() => {
      return {
        ...compareCustomerBaseProperties(currentDocument, originalDocument),
        ...compareCustomerBlacklists(currentDocument.blacklistedCustomers, originalDocument.blacklistedCustomers),
        ...compareCustomerJobs(currentDocument.jobs, originalDocument.jobs.filter(j => j.name !== jobName)),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'blacklistedCustomers', 'jobs');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenUpdatedInCustomerJobs(req: Customer.Job.Request, jobName: Customer.Job.Request['name'], originalDocument: Customer.Document, currentDocument: Customer.Document) {

    const comparer = createComparer(() => {
      return {
        ...compareCustomerBaseProperties(currentDocument, originalDocument),
        ...compareCustomerBlacklists(currentDocument.blacklistedCustomers, originalDocument.blacklistedCustomers),
        ...compareCustomerJobs(currentDocument.jobs, originalDocument.jobs, req, jobName),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'blacklistedCustomers', 'jobs');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
});
