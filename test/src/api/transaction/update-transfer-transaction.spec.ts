import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';

describe('PUT transaction/v1/transactions/{transactionId}/transfer (transfer)', () => {
  let request: Transaction.TransferRequest;
  let originalDocument: Transaction.PaymentDocument;

  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let relatedDocumentIds: Pick<Transaction.TransferRequest, 'accountId' | 'transferAccountId'> ;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    transferAccountDocument = accountDataFactory.document();

    originalDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    relatedDocumentIds = {
      accountId: getAccountId(accountDocument),
      transferAccountId: getAccountId(transferAccountDocument),
    };

    request = transferTransactionDataFactory.request(relatedDocumentIds);

  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateToTransferTransaction(transferTransactionDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should update transaction', () => {
      it('between non-loan accounts', () => {
        cy.saveTransactionDocument(originalDocument)
          .saveAccountDocuments([
            accountDocument,
            transferAccountDocument,
          ])
          .authenticate(1)
          .requestUpdateToTransferTransaction(getTransactionId(originalDocument), request)
          .expectCreatedResponse()
          .validateTransactionTransferDocument(request);
      });

      it('between two loan accounts', () => {
        accountDocument = accountDataFactory.document({
          accountType: 'loan',
        });

        transferAccountDocument = accountDataFactory.document({
          accountType: 'loan',
        });

        request = transferTransactionDataFactory.request({
          accountId: getAccountId(accountDocument),
          transferAccountId: getAccountId(transferAccountDocument),
        });

        cy.saveTransactionDocument(originalDocument)
          .saveAccountDocuments([
            accountDocument,
            transferAccountDocument,
          ])
          .authenticate(1)
          .requestUpdateToTransferTransaction(getTransactionId(originalDocument), request)
          .expectCreatedResponse()
          .validateTransactionTransferDocument(request);
      });

      it('with payments', () => {
        const deferredTransactionDocument = deferredTransactionDataFactory.document({
          body: {
            amount: -5000,
          },
          account: accountDocument,
          loanAccount: transferAccountDocument,
        });

        request = transferTransactionDataFactory.request({
          accountId: getAccountId(accountDocument),
          transferAccountId: getAccountId(transferAccountDocument),
          amount: 2000,
          payments: [
            {
              amount: 1500,
              transactionId: getTransactionId(deferredTransactionDocument),
            },
          ],
        });

        cy.saveAccountDocuments([
          accountDocument,
          transferAccountDocument,
        ])
          .saveTransactionDocuments([
            originalDocument,
            deferredTransactionDocument,
          ])
          .authenticate(1)
          .requestUpdateToTransferTransaction(getTransactionId(originalDocument), request)
          .expectCreatedResponse()
          .validateTransactionTransferDocument(request);
      });

      it('with payment amount max out by deferred transaction amount', () => {
        const deferredTransactionDocument = deferredTransactionDataFactory.document({
          body: {
            amount: -500,
          },
          account: accountDocument,
          loanAccount: transferAccountDocument,
        });

        request = transferTransactionDataFactory.request({
          accountId: getAccountId(accountDocument),
          transferAccountId: getAccountId(transferAccountDocument),
          amount: 2000,
          payments: [
            {
              amount: 1500,
              transactionId: getTransactionId(deferredTransactionDocument),
            },
          ],
        });

        cy.saveAccountDocuments([
          accountDocument,
          transferAccountDocument,
        ])
          .saveTransactionDocuments([
            originalDocument,
            deferredTransactionDocument,
          ])
          .authenticate(1)
          .requestUpdateToTransferTransaction(getTransactionId(originalDocument), request)
          .expectCreatedResponse()
          .validateTransactionTransferDocument(request, [Math.abs(deferredTransactionDocument.amount)]);

      });

      describe('without optional properties', () => {
        it('description', () => {
          request = transferTransactionDataFactory.request({
            ...relatedDocumentIds,
            description: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveAccountDocument(transferAccountDocument)
            .authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionTransferDocument(request);
        });

        it('transferAmount', () => {
          request = transferTransactionDataFactory.request({
            ...relatedDocumentIds,
            transferAmount: undefined,
          });
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .saveAccountDocument(transferAccountDocument)
            .authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), request)
            .expectCreatedResponse()
            .validateTransactionTransferDocument(request);
        });
      });
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(transferTransactionDataFactory.id('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(transferTransactionDataFactory.id(), request)
            .expectNotFoundResponse();
        });
      });

      describe('if body', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              extra: 123,
            } as any))
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });
      });

      describe('if amount', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              amount: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('amount', 'body');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              amount: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('amount', 'number', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              description: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              description: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if issuedAt', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              issuedAt: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('issuedAt', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              issuedAt: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('issuedAt', 'string', 'body');
        });

        it('is not date-time format', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              issuedAt: 'not-date-time',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('issuedAt', 'date-time', 'body');
        });
      });

      describe('if accountId', () => {
        it('does not belong to any account', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(transferAccountDocument)
            .authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              ...relatedDocumentIds,
              accountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });
        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              accountId: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('accountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              accountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('accountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              accountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'body');
        });
      });

      describe('if transferAccountId', () => {
        it('is the same as accountId', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              ...relatedDocumentIds,
              transferAccountId: getAccountId(accountDocument),
            }))
            .expectBadRequestResponse()
            .expectMessage('Cannot transfer to same account');
        });

        it('does not belong to any account', () => {
          cy.saveTransactionDocument(originalDocument)
            .saveAccountDocument(accountDocument)
            .authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              ...relatedDocumentIds,
              transferAccountId: accountDataFactory.id(),
            }))
            .expectBadRequestResponse()
            .expectMessage('No account found');
        });

        it('is missing', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              transferAccountId: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('transferAccountId', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              transferAccountId: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('transferAccountId', 'string', 'body');
        });

        it('is not mongo id format', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              transferAccountId: accountDataFactory.id('not-mongo-id'),
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transferAccountId', 'body');
        });
      });

      describe('if transferAmount', () => {
        it('is not number', () => {
          cy.authenticate(1)
            .requestUpdateToTransferTransaction(getTransactionId(originalDocument), transferTransactionDataFactory.request({
              transferAmount: '1',
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('transferAmount', 'number', 'body');
        });
      });
    });
  });
});
