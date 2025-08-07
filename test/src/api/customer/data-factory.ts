import { DataFactoryFunction } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { customerDocumentConverter } from '@household/shared/dependencies/converters/customer-document-converter';
import { createId } from '@household/test/api/utils';

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
      ...req,
    };
  };

  const createCustomerDocument: DataFactoryFunction<Customer.Request, Customer.Document> = (req) => {
    return customerDocumentConverter.create(createCustomerRequest(req), Cypress.env('EXPIRES_IN'), true);
  };
  return {
    request: createCustomerRequest,
    document: createCustomerDocument,
    id: (createId<Customer.Id>),
  };
})();
