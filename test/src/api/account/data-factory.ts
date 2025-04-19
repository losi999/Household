import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';
import { AccountType } from '@household/shared/enums';

export const accountDataFactory = (() => {
  const createAccountRequest: DataFactoryFunction<Account.Request> = (req) => {
    return {
      accountType: faker.helpers.arrayElement(Object.values(AccountType).filter(a => a !== AccountType.Loan)),
      name: `${faker.finance.accountName()} ${faker.finance.accountNumber()}`,
      currency: faker.finance.currencySymbol(),
      owner: faker.person.firstName(),
      ...req,
    };
  };

  const createAccountDocument: DataFactoryFunction<Account.Request, Account.Document> = (req) => {
    return accountDocumentConverter.create(createAccountRequest(req), Cypress.env('EXPIRES_IN'), true);
  };
  return {
    id: (createId<Account.Id>),
    request: createAccountRequest,
    document: createAccountDocument,
  };
})();
