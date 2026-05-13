import { Customer, Price } from '@household/shared/types/types';
import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { getPriceId } from '@household/shared/common/utils';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const customerDataFactory = (() => {
  const createCustomerDocument = (ctx?: {
    body?: Partial<Customer.Request>
    jobs?: {
      body?: Partial<Omit<Customer.Job.Request, 'prices'>>;
      prices: (Partial<Customer.Job.Quantity> & {price: Price.Document})[];
    }[];
    blacklistedCustomers?: Customer.Document[];
  }): Customer.Document => {
    const defaultCustomerDocument = customerDocumentConverter.create(testDataFactory.customer.request(ctx?.body), Number(process.env.EXPIRES_IN), true);

    const jobs = ctx?.jobs?.map<Customer.Job.Document>((j) => {
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
