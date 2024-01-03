import { createAccountId } from '@household/shared/common/test-data-factory';
import { getAccountId } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST transaction/v1/transactions/transfer', () => {
  let request: Transaction.TransferRequest;
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: `bank-${uuid()}`,
      accountType: 'bankAccount',
      currency: 'Ft',
      owner: 'owner1',
    }, Cypress.env('EXPIRES_IN'), true);

    transferAccountDocument = accountDocumentConverter.create({
      name: `wallett-${uuid()}`,
      accountType: 'cash',
      currency: '$',
      owner: 'owner1',
    }, Cypress.env('EXPIRES_IN'), true);

    request = {
      accountId: getAccountId(accountDocument),
      transferAccountId: getAccountId(transferAccountDocument),
      amount: 100,
      transferAmount: -1200,
      description: 'description',
      issuedAt: new Date(2022, 6, 9, 22, 30, 12).toISOString(),
    };
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateTransferTransaction(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should create transaction', () => {
      it('with complete body', () => {
        cy.saveAccountDocument(accountDocument)
          .saveAccountDocument(transferAccountDocument)
          .authenticate(1)
          .requestCreateTransferTransaction(request)
          .expectCreatedResponse()
          .validateTransactionTransferDocument(request);
      });

      describe('without optional properties', () => {
        it('description', () => {
          const modifiedRequest: Transaction.TransferRequest = {
            ...request,
            description: undefined,
          };
          cy.saveAccountDocument(accountDocument)
            .saveAccountDocument(transferAccountDocument)
            .authenticate(1)
            .requestCreateTransferTransaction(modifiedRequest)
            .expectCreatedResponse()
            .validateTransactionTransferDocument(modifiedRequest);
        });
      });
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              extra: 123,
            } as any)
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              amount: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              amount: '1' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              issuedAt: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              issuedAt: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              issuedAt: 'not-date-time',
            })
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
        });
      });

      describe('if accountId', () => {
        it('does not belong to any account', () => {
          cy.saveAccountDocument(transferAccountDocument)
            .authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              accountId: createAccountId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              accountId: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              accountId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              accountId: createAccountId('not-mongo-id'),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'body');
        });
      });

      describe('if transferAccountId', () => {
        it('is the same as accountId', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              transferAccountId: getAccountId(accountDocument),
            })
            .expectBadRequestResponse()
            .expectMessage('Cannot transfer to same account');
        });

        it('does not belong to any account', () => {
          cy.saveAccountDocument(accountDocument)
            .authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              transferAccountId: createAccountId(),
            })
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              transferAccountId: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('transferAccountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              transferAccountId: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('transferAccountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction({
              ...request,
              transferAccountId: createAccountId('not-mongo-id'),
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transferAccountId', 'body');
        });
      });
    });
  });
});
