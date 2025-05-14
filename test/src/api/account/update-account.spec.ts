import { getAccountId } from '@household/shared/common/utils';
import { Account } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';

describe('PUT /account/v1/accounts/{accountId}', () => {
  let request: Account.Request;
  let accountDocument: Account.Document;

  beforeEach(() => {
    request = accountDataFactory.request();

    accountDocument = accountDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateAccount(accountDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should update account', () => {
      cy.saveAccountDocument(accountDocument)
        .authenticate('admin')
        .requestUpdateAccount(getAccountId(accountDocument), request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });

    it('should update account with an existing name for a different owner', () => {
      const sameNameAccountDocument = accountDataFactory.document({
        ...request,
        owner: 'different owner',
      });

      cy.saveAccountDocuments([
        accountDocument,
        sameNameAccountDocument,
      ])
        .authenticate('admin')
        .requestCreateAccount(request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              name: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different account of the same owner', () => {
          const duplicateAccountDocument = accountDataFactory.document(request);

          cy.saveAccountDocument(accountDocument)
            .saveAccountDocument(duplicateAccountDocument)
            .authenticate('admin')
            .requestUpdateAccount(getAccountId(accountDocument), request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate account name');
        });
      });

      describe('if accountType', () => {
        it('is missing from body', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              accountType: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              accountType: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              accountType: <any>'not-account-type',
            }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('accountType', 'body');
        });
      });

      describe('if currency', () => {
        it('is missing from body', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              currency: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              currency: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              currency: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });

      describe('if owner', () => {
        it('is missing from body', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              owner: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('owner', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              owner: <any>1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('owner', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
              owner: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('owner', 1, 'body');
        });
      });

      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });

        it('does not belong to any account', () => {
          cy.authenticate('admin')
            .requestUpdateAccount(accountDataFactory.id(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
