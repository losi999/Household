import { createAccountId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { Account, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('POST transaction/v1/transactions/transfer', () => {
  let request: Transaction.TransferRequest;
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: 'bank',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();

    transferAccountDocument = accountDocumentConverter.create({
      name: 'wallett',
      accountType: 'cash',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    transferAccountDocument._id = new Types.ObjectId();

    request = {
      accountId: createAccountId(accountDocument._id),
      transferAccountId: createAccountId(transferAccountDocument._id),
      amount: 100,
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
              transferAccountId: createAccountId(accountDocument._id),
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

        it('is a different currency than base account', () => {
          cy.saveAccountDocument(accountDocument)
            .saveAccountDocument({
              ...transferAccountDocument,
              currency: '$',
            })
            .authenticate(1)
            .requestCreateTransferTransaction(request)
            .expectBadRequestResponse()
            .expectMessage('Accounts must be in the same currency');
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
