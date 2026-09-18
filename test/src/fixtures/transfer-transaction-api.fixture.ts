import { Api } from '@household/shared/types/api';
import { Comparer } from '@household/test/comparer';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { TransactionType } from '@household/shared/enums';
import { createDate, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { validateAccountResponse } from '@household/test/fixtures/account-api.fixture';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export const validateTransferTransactionResponse = (response: Responses.TransferTransaction, document: Documents.TransferTransaction, viewingAccountId: Api.Account.Id = getAccountId(document.account)) => {
  return new Comparer(response, {
    transactionId: getTransactionId(document),
    amount: getAccountId(document.account) === viewingAccountId ? document.amount : document.transferAmount,
    transferAmount: getAccountId(document.account) === viewingAccountId ? document.transferAmount : document.amount,
    issuedAt: document.issuedAt.toISOString(),
    description: document.description,
    transactionType: document.transactionType,
    account: validateAccountResponse(response.account, getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount),
    transferAccount: validateAccountResponse(response.transferAccount, getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account),
  });
};

const validateTransferTransactionDocuments = (originalDocument: Documents.TransferTransaction, currentDocument: Documents.TransferTransaction) => {
  return new Comparer(currentDocument, {
    transactionType: originalDocument.transactionType,
    description: originalDocument.description,
    amount: originalDocument.amount,
    transferAmount: originalDocument.transferAmount,
    issuedAt: originalDocument.issuedAt.toISOString(),
    account: getAccountId(originalDocument.account),
    transferAccount: getAccountId(originalDocument.transferAccount),  
  }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsTransferTransactionDocument(req: Requests.TransferTransaction, document: Documents.TransferTransaction) {
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
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected transfer transaction to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toBeTheSame(originalDocument: Documents.TransferTransaction, currentDocument: Documents.TransferTransaction) {
    const comparer = validateTransferTransactionDocuments(originalDocument, currentDocument);
  
    const errors = comparer.validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected document to match transfer transaction, but it did not:\n${errors.join('\n')}`,   
    };
  },
  async toContainMatchingTransferTransactionDocument(received: APIResponse, document: Documents.TransferTransaction, viewingAccountId: Api.Account.Id) {
    const response = await received.json() as Responses.TransferTransaction[];

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
  async toMatchTransferTransactionDocument(res: APIResponse, document: Documents.TransferTransaction, viewingAccountId: Api.Account.Id) {
    const response = await res.json() as Responses.TransferTransaction;

    const comparer = validateTransferTransactionResponse(response, document, viewingAccountId);
  
    const errors = comparer.validate();
    
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match transfer transaction document, but it did not:\n${errors.join('\n')}`,
    };  
  },
});
