import { Account } from '@household/shared/types/types';

describe('POST account/v1/accounts', () => {
  const request: Account.Request = {
    name: 'name',
    accountType: 'bankAccount',
    currency: 'Ft',
  };

  describe('called as an admin', () => {

    it('should create account', () => {
      cy.authenticate('admin1')
        .requestCreateAccount(request)
        .expectCreatedResponse()
        .validateAccountDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if accountType', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              accountType: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountType', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              accountType: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              accountType: 'not-account-type' as any,
            })
            .expectBadRequestResponse()
            .expectWrongEnumValue('accountType', 'body');
        });
      });

      describe('if currency', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              currency: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('currency', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              currency: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('currency', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestCreateAccount({
              ...request,
              currency: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('currency', 1, 'body');
        });
      });
    });
  });
});
