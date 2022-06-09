import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as schema } from '@household/test/api/schemas/account-response-list';
import { Account } from '@household/shared/types/types';

describe('GET /account/v1/accounts', () => {
  const account1: Account.Request = {
    name: 'account 1',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  const account2: Account.Request = {
    name: 'account 2',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  let accountDocument1: Account.Document;
  let accountDocument2: Account.Document;

  beforeEach(() => {
    accountDocument1 = accountDocumentConverter.create(account1, Cypress.env('EXPIRES_IN'));
    accountDocument2 = accountDocumentConverter.create(account2, Cypress.env('EXPIRES_IN'));
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetAccountList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of accounts', () => {
      cy.accountTask('saveAccount', [accountDocument1])
        .accountTask('saveAccount', [accountDocument2])
        .authenticate('admin1')
        .requestGetAccountList()
        .expectOkResponse()
        .expectValidResponseSchema(schema);
    });
  });
});
