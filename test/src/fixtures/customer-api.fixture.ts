import { headerExpiresIn } from '@household/shared/constants';
import { Customer } from '@household/shared/types/types';
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

export const expect = baseExpect.extend({});
