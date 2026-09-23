import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { getPriceId } from '@household/shared/common/utils';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

export const customerDataFactory = (() => {
  const createCustomerDocument = (ctx?: {
    body?: Partial<Requests.Customer>
    jobs?: {
      body?: Partial<Omit<Requests.CustomerJob, 'prices'>>;
      prices: (Partial<Api.Customer.Job.Quantity> & {price: Documents.Price})[];
    }[];
    blacklistedCustomers?: Documents.Customer[];
  }): Documents.Customer => {
    const defaultCustomerDocument = customerDocumentConverter.create(testDataFactory.customer.request(ctx?.body), Number(process.env.EXPIRES_IN), true);

    const jobs = ctx?.jobs?.map<Documents.CustomerJob>((j) => {
      const jobUpdate = customerDocumentConverter.addJob(testDataFactory.customer.job.request({
        body: j.body,
        prices: j.prices?.map(({ price, ...rest }) => {
          return {
            priceId: getPriceId(price),
            ...rest,
          };
        }),
      }), j.prices?.map((p) => p.price) ?? []);

      return jobUpdate.update.$push.jobs;
    }) ?? defaultCustomerDocument.jobs;
    return {
      ...defaultCustomerDocument,
      jobs,
      blacklistedCustomers: ctx?.blacklistedCustomers ?? defaultCustomerDocument.blacklistedCustomers,
    };
  };
  return {
    request: testDataFactory.customer.request,
    document: createCustomerDocument,
    jobRequest: testDataFactory.customer.job.request,
    id: testDataFactory.customer.id,
  };
})();
