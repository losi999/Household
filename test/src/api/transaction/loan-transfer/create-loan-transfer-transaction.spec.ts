import { getAccountId } from '@household/shared/common/utils';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer/loan-transfer-data-factory';

describe('POST transaction/v1/transactions/transfer (loanTransfer)', () => {
  let request: Transaction.TransferRequest;
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let relatedDocumentIds: Pick<Transaction.TransferRequest, 'accountId' | 'transferAccountId'> ;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: 'loan',
    });

    relatedDocumentIds = {
      accountId: getAccountId(accountDocument),
      transferAccountId: getAccountId(loanAccountDocument),
    };

    request = loanTransferTransactionDataFactory.request(relatedDocumentIds);
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
      it('between a non-loan and a loan account', () => {
        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .authenticate(1)
          .requestCreateTransferTransaction(request)
          .expectCreatedResponse()
          .validateTransactionLoanTransferDocument(request);
      });

      describe('without optional properties', () => {
        it('description', () => {
          request = loanTransferTransactionDataFactory.request({
            ...relatedDocumentIds,
            description: undefined,
          });

          cy.saveAccountDocuments([
            accountDocument,
            loanAccountDocument,
          ])
            .authenticate(1)
            .requestCreateTransferTransaction(request)
            .expectCreatedResponse()
            .validateTransactionLoanTransferDocument(request);
        });
      });
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              extra: 123,
            } as any))
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              amount: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              amount: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              description: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              description: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              issuedAt: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              issuedAt: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              issuedAt: 'not-date-time',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
        });
      });

      describe('if accountId', () => {
        it('does not belong to any account', () => {
          cy.saveAccountDocument(loanAccountDocument)
            .authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              ...relatedDocumentIds,
              accountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });
        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              accountId: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              accountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              accountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'body');
        });
      });

      describe('if transferAccountId', () => {
        it('is the same as accountId', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              ...relatedDocumentIds,
              transferAccountId: getAccountId(accountDocument),
            }))
            .expectBadRequestResponse()
            .expectMessage('Cannot transfer to same account');
        });

        it('does not belong to any account', () => {
          cy.saveAccountDocument(accountDocument)
            .authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              ...relatedDocumentIds,
              transferAccountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              transferAccountId: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('transferAccountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              transferAccountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('transferAccountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestCreateTransferTransaction(loanTransferTransactionDataFactory.request({
              transferAccountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transferAccountId', 'body');
        });
      });
    });
  });
});
