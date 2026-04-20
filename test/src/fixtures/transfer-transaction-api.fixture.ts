import { Account, Transaction } from '@household/shared/types/types';
import { createComparer } from '@household/test/utils';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { TransactionType } from '@household/shared/enums';
import { createDate, getAccountId, getTransactionId } from '@household/shared/common/utils';

export const expect = baseExpect.extend({
  toHaveBeenSavedAsTransferTransactionDocument(req: Transaction.TransferRequest, document: Transaction.TransferDocument) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected transaction to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        transactionType: compare(document.transactionType, TransactionType.Transfer),
        description: compare(document.description, req.description),
        amount: compare(document.amount, req.amount),
        transferAmount: compare(document.transferAmount, req.transferAmount ?? req.amount * -1),
        issuedAt: compare(document.issuedAt.toISOString(), createDate(req.issuedAt).toISOString()),
        account: compare(getAccountId(document.account), req.accountId),
        transferAccount: compare(getAccountId(document.transferAccount), req.transferAccountId),  
      };  
    });
  
    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'payments');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveNotChanged(originalDocument: Transaction.TransferDocument, currentDocument: Transaction.TransferDocument) {
    const comparer = createComparer((compare) => {
      return {
        transactionType: compare(currentDocument.transactionType, originalDocument.transactionType),
        description: compare(currentDocument.description, originalDocument.description),
        amount: compare(currentDocument.amount, originalDocument.amount),
        transferAmount: compare(currentDocument.transferAmount, originalDocument.transferAmount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        account: compare(getAccountId(currentDocument.account), getAccountId(originalDocument.account)),
        transferAccount: compare(getAccountId(currentDocument.transferAccount), getAccountId(originalDocument.transferAccount)),  
        ...currentDocument.payments.reduce((accumulator, currentValue, index) => {
          const originalPayment = originalDocument.payments?.[index];

          return {
            ...accumulator,
            [`payments[${index}].amount`]: compare(currentValue.amount, originalPayment?.amount),
            [`payments[${index}].transaction`]: compare(getTransactionId(currentValue.transaction), getTransactionId(originalPayment?.transaction)), 
          };
        }, {}),
      };  
    });
  
    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'payments');
  
    return {
      pass: !message,
      message: () => message,   
    };
  },
  toHaveBeenDeletedFromPayments(originalDocument: Transaction.TransferDocument, currentDocument: Transaction.TransferDocument, loanTransactionId: Transaction.Id) {

    const filteredPayments = originalDocument.payments.filter(payment => getTransactionId(payment.transaction) === loanTransactionId);

    const comparer = createComparer((compare) => {
      return {
        transactionType: compare(currentDocument.transactionType, originalDocument.transactionType),
        description: compare(currentDocument.description, originalDocument.description),
        amount: compare(currentDocument.amount, originalDocument.amount),
        transferAmount: compare(currentDocument.transferAmount, originalDocument.transferAmount),
        issuedAt: compare(currentDocument.issuedAt.toISOString(), originalDocument.issuedAt.toISOString()),
        account: compare(getAccountId(currentDocument.account), getAccountId(originalDocument.account)),
        transferAccount: compare(getAccountId(currentDocument.transferAccount), getAccountId(originalDocument.transferAccount)),  
        ...currentDocument.payments.reduce((accumulator, currentValue, index) => {
          const originalPayment = filteredPayments[index];

          return {
            ...accumulator,
            [`payments[${index}].amount`]: compare(currentValue.amount, originalPayment?.amount),
            [`payments[${index}].transaction`]: compare(getTransactionId(currentValue.transaction), getTransactionId(originalPayment?.transaction)), 
          };
        }, {}),
      };  
    });
  
    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'payments');
  
    return {
      pass: !message,
      message: () => message,   
    };
  },
  async toMatchTransferTransactionDocument(res: APIResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id) {
    const response = await res.json() as Transaction.TransferResponse;
  
    const comparer = createComparer((compare) => {
      const documentAmount = getAccountId(document.account) === viewingAccountId ? document.amount : document.transferAmount;
      const documentAccount = getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount;
      const documentTransferAmount = getAccountId(document.account) === viewingAccountId ? document.transferAmount : document.amount;
      const documentTransferAccount = getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account;

      return {
        transactionId: compare(response.transactionId, getTransactionId(document)),
        amount: compare(response.amount, documentAmount),
        transferAmount: compare(response.transferAmount, documentTransferAmount),
        issuedAt: compare(response.issuedAt, document.issuedAt.toISOString()),
        description: compare(response.description, document.description),
        transactionType: compare(response.transactionType, document.transactionType),
        'account.accountId': compare(response.account.accountId, getAccountId(documentAccount)),
        'account.accountType': compare(response.account.accountType, documentAccount.accountType),
        'account.balance': compare(response.account.balance, documentAccount.balance),
        'account.currency': compare(response.account.currency, documentAccount.currency),
        'account.fullName': compare(response.account.fullName, `${documentAccount.name} (${documentAccount.owner})`),
        'account.isOpen': compare(response.account.isOpen, documentAccount.isOpen),
        'account.name': compare(response.account.name, documentAccount.name),
        'account.owner': compare(response.account.owner, documentAccount.owner),
        'transferAccount.accountId': compare(response.transferAccount.accountId, getAccountId(documentTransferAccount)),
        'transferAccount.accountType': compare(response.transferAccount.accountType, documentTransferAccount.accountType),
        'transferAccount.balance': compare(response.transferAccount.balance, documentTransferAccount.balance),
        'transferAccount.currency': compare(response.transferAccount.currency, documentTransferAccount.currency),
        'transferAccount.fullName': compare(response.transferAccount.fullName, `${documentTransferAccount.name} (${documentTransferAccount.owner})`),
        'transferAccount.isOpen': compare(response.transferAccount.isOpen, documentTransferAccount.isOpen),
        'transferAccount.name': compare(response.transferAccount.name, documentTransferAccount.name),
        'transferAccount.owner': compare(response.transferAccount.owner, documentTransferAccount.owner),
        // payments
      };
    });
  
    const message = comparer.validate(response, 'account', 'transferAccount', 'payments');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
});
