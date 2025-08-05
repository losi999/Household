import { entries, getAccountId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { Account } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';

const permissionMap = allowUsers('editor') ;

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

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestUpdateAccount(accountDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        it('should update account', () => {
          cy.saveAccountDocument(accountDocument)
            .authenticate(userType)
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
            .authenticate(userType)
            .requestCreateAccount(request)
            .expectCreatedResponse()
            .validateAccountDocument(request);
        });
        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
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
                .authenticate(userType)
                .requestUpdateAccount(getAccountId(accountDocument), request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate account name');
            });
          });

          describe('if accountType', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  accountType: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('accountType', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  accountType: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('accountType', 'string', 'body');
            });

            it('is not a valid enum value', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  accountType: <any>'not-account-type',
                }))
                .expectBadRequestResponse()
                .expectWrongEnumValue('accountType', 'body');
            });
          });

          describe('if currency', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  currency: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('currency', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  currency: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('currency', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  currency: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('currency', 1, 'body');
            });
          });

          describe('if owner', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  owner: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('owner', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  owner: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('owner', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), accountDataFactory.request({
                  owner: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('owner', 1, 'body');
            });
          });

          describe('if accountId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('accountId', 'pathParameters');
            });

            it('does not belong to any account', () => {
              cy.authenticate(userType)
                .requestUpdateAccount(accountDataFactory.id(), request)
                .expectNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
