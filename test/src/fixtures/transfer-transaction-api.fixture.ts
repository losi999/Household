import { Account, Transaction } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { TransactionType } from '@household/shared/enums';
import { createDate, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { validateAccountResponse } from '@household/test/fixtures/account-api.fixture';
import { validateDeferredTransactionResponse } from '@household/test/fixtures/deferred-transaction-api.fixture';

export const validateTransferTransactionResponse = (response: Transaction.TransferResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id = getAccountId(document.account)) => {
  return new Comparer(response, {
    transactionId: getTransactionId(document),
    amount: getAccountId(document.account) === viewingAccountId ? document.amount : document.transferAmount,
    transferAmount: getAccountId(document.account) === viewingAccountId ? document.transferAmount : document.amount,
    issuedAt: document.issuedAt.toISOString(),
    description: document.description,
    transactionType: document.transactionType,
    account: validateAccountResponse(response.account, getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount),
    transferAccount: validateAccountResponse(response.transferAccount, getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account),
    payments: response.payments.map((paymentResponse, index) => {
      const paymentDocument = document.payments?.[index];

      return new Comparer(paymentResponse, {
        amount: paymentDocument?.amount,
        transaction: validateDeferredTransactionResponse(paymentResponse.transaction, paymentDocument?.transaction, paymentDocument?.amount),
      });
    }),
  });
};

const validateTransferTransactionDocuments = (originalDocument: Transaction.TransferDocument, currentDocument: Transaction.TransferDocument) => {
  return new Comparer(currentDocument, {
    transactionType: originalDocument.transactionType,
    description: originalDocument.description,
    amount: originalDocument.amount,
    transferAmount: originalDocument.transferAmount,
    issuedAt: originalDocument.issuedAt.toISOString(),
    account: getAccountId(originalDocument.account),
    transferAccount: getAccountId(originalDocument.transferAccount),  
    payments: currentDocument.payments.map((payment, index) => {
      const originalPayment = originalDocument.payments[index];

      return new Comparer(payment, {
        amount: originalPayment.amount,
        transaction: getTransactionId(originalPayment.transaction),
      });
    }),
  }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsTransferTransactionDocument(req: Transaction.TransferRequest, document: Transaction.TransferDocument, paymentAmounts?: number[]) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      transactionType: TransactionType.Transfer,
      description: req.description,
      amount: req.amount,
      transferAmount: req.transferAmount ?? req.amount * -1,
      issuedAt: createDate(req.issuedAt).toISOString(),
      account: req.accountId,
      transferAccount: req.transferAccountId,  
      payments: document.payments.map((payment, index) => {
        const paymentRequest = req.payments[index];

        return new Comparer(payment, {
          amount: paymentAmounts?.[index] ?? paymentRequest.amount,
          transaction: paymentRequest.transactionId,
        });
      }),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected transfer transaction to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toBeTheSame(originalDocument: Transaction.TransferDocument, currentDocument: Transaction.TransferDocument) {
    const comparer = validateTransferTransactionDocuments(originalDocument, currentDocument);
  
    const errors = comparer.validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected document to match transfer transaction, but it did not:\n${errors.join('\n')}`,   
    };
  },
  toHavePaymentRemoved(originalDocument: Transaction.TransferDocument, currentDocument: Transaction.TransferDocument, deletedLoanTransactionId: Transaction.Id) {

    const filteredPayments = originalDocument.payments.filter(payment => getTransactionId(payment.transaction) === deletedLoanTransactionId);

    const comparer = new Comparer(currentDocument, [
      validateTransferTransactionDocuments(originalDocument, currentDocument),
      {
        payments: currentDocument.payments.map((payment, index) => {
          const originalPayment = filteredPayments[index];

          return new Comparer(payment, {
            amount: originalPayment.amount,
            transaction: getTransactionId(originalPayment.transaction),
          });
        }),
      },
    ], '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected document to match transfer transaction, but it fif not:\n${errors.join('\n')}`,   
    };
  },
  async toContainMatchingTransferTransactionDocument(received: APIResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id) {
    const response = await received.json() as Transaction.TransferResponse[];

    const matchingResponse = response.find(r => r.transactionId === getTransactionId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a transaction with id ${getTransactionId(document)}, but it was not found`,
      };
    }

    const comparer = validateTransferTransactionResponse(matchingResponse, document, viewingAccountId);
  
    const errors = comparer.validate();
    
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match transfer transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
  async toMatchTransferTransactionDocument(res: APIResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id) {
    const response = await res.json() as Transaction.TransferResponse;

    const comparer = validateTransferTransactionResponse(response, document, viewingAccountId);
  
    const errors = comparer.validate();
    
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match transfer transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
});
