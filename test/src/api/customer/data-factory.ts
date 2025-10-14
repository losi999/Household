import { DataFactoryFunction } from '@household/shared/types/common';
import { Customer, Price } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { createId } from '@household/test/api/utils';
import { getPriceId } from '@household/shared/common/utils';

export const customerDataFactory = (() => {
  const createCustomerRequest: DataFactoryFunction<Customer.Request> = (req) => {
    return {
      name: `${faker.person.firstName()} ${faker.string.uuid()}`,
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      isGroup: faker.datatype.boolean(),
      rating: faker.number.int({
        min: 1,
        max: 5,
      }),
      ...req,
    };
  };

  const createCustomerJobRequest = (ctx?: {
    body?: Partial<Omit<Customer.Job.Request, 'prices'>>;
    prices?: {
      custom?: Partial<Price.Base>[];
      listed?: Partial<Customer.Job.ListedPrice<Price.PriceId>>[];
    };
  }): Customer.Job.Request => {
    return {
      name: `${faker.company.buzzVerb()} ${faker.string.uuid()}`,
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      duration: faker.number.int({
        min: 1,
        max: 96,
      }),
      prices: (ctx?.prices?.custom || ctx?.prices?.listed) ? [
        ...ctx?.prices.custom?.map((p) => {
          return {
            name: faker.commerce.product(),
            amount: faker.number.int({
              min: 1,
              max: 10000,
            }), 
            ...p,
          };
        }) ?? [],
        ...ctx?.prices.listed?.map((p) => {
          return {
            priceId: p.priceId,
            quantity: faker.number.int({
              min: 1,
              max: 5,
            }),
            ...p,
          };
        }) ?? [],
      ] : [
        {
          name: faker.commerce.product(),
          amount: faker.number.int({
            min: 1,
            max: 10000,
          }), 
        },
      ],
      ...ctx?.body,
    };
  };

  const createCustomerDocument = (ctx?: {
    body?: Partial<Customer.Request>
    jobs?: {
      body?: Partial<Omit<Customer.Job.Request, 'prices'>>;
      prices?: {
        custom?: Partial<Price.Base>[];
        listed?: (Partial<Customer.Job.Quantity> & {price: Price.Document})[];
      }; 
    }[];
    blacklistedCustomers?: Customer.Document[];
  }): Customer.Document => {
    const defaultCustomerDocument = customerDocumentConverter.create(createCustomerRequest(ctx?.body), Cypress.env('EXPIRES_IN'), true);

    const jobs = ctx?.jobs?.map<Customer.Job.Document>((j) => {
      const jobUpdate = customerDocumentConverter.addJob(createCustomerJobRequest({
        body: j.body,
        prices: {
          custom: j.prices?.custom,
          listed: j.prices?.listed?.map(({ price, ...rest }) => {
            return {
              priceId: getPriceId(price),
              ...rest,
            };
          }),
        },
      }), j.prices?.listed?.map((p) => p.price) ?? []);

      return jobUpdate.update.$push.jobs;
    }) ?? defaultCustomerDocument.jobs;
    return {
      ...defaultCustomerDocument,
      jobs,
      blacklistedCustomers: ctx?.blacklistedCustomers ?? defaultCustomerDocument.blacklistedCustomers,
    };
  };
  return {
    request: createCustomerRequest,
    document: createCustomerDocument,
    jobRequest: createCustomerJobRequest,
    id: (createId<Customer.Id>),
  };
})();
