import { Account, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { validateCommonResponse } from '@household/test/api/transaction/common/commands/validations';

const validateTransactionTransferDocument = (response: Transaction.TransactionId, request: Transaction.TransferRequest, paymentAmounts?: number[]) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.TransferDocument) => {
      const { amount, issuedAt, transactionType, description, transferAccount, transferAmount, account, payments, ...internal } = document;

      expect(getTransactionId(document), 'id').to.equal(id);
      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('transfer');
      expect(description, 'description').to.equal(request.description);
      expect(transferAmount, 'transferAmount').to.equal(request.transferAmount ?? request.amount * -1);
      expect(getAccountId(account), 'account').to.equal(request.accountId);
      expect(getAccountId(transferAccount), 'transferAccount').to.equal(request.transferAccountId);

      payments?.forEach((payment, index) => {
        const paymentRequest = request.payments[index];

        const { amount, transaction, ...internal } = payment;
        expect(amount, `payments[${index}].amount`).to.equal(paymentAmounts?.[index] ?? paymentRequest.amount);
        expect(getTransactionId(transaction), `payments[${index}].transaction`).to.equal(paymentRequest.transactionId);
        expectRemainingProperties(internal);
      });

      expectRemainingProperties(internal);
    });
};

export const validateTransactionTransferResponse = (response: Transaction.TransferResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id) => {
  const documentAmount = getAccountId(document.account) === viewingAccountId ? document.amount : document.transferAmount;
  const documentAccount = getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount;
  const documentTransferAmount = getAccountId(document.account) === viewingAccountId ? document.transferAmount : document.amount;
  const documentTransferAccount = getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account;

  const { transactionId, amount, issuedAt, transactionType, description, account, transferAccount, transferAmount, payments, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, {
    ...document,
    amount: documentAmount,
  });
  expect(transferAmount, 'transferAmount').to.equal(documentTransferAmount);

  cy.validateNestedAccountResponse('account.', account, documentAccount, documentAccount.balance ?? null)
    .validateNestedAccountResponse('transferAccount.', transferAccount, documentTransferAccount, documentTransferAccount.balance ?? null);

  payments?.forEach((p, index) => {
    const documentItem = document.payments[index];
    const { amount, transaction } = p;

    expect(amount, `payments[${index}].amount`).to.equal(documentItem.amount);
    expect(transaction.transactionId, `payments[${index}].transactionId`).to.equal(getTransactionId(documentItem.transaction));
  });
  expectEmptyObject(empty, 'response');

};

const validateRelatedRepaymentDeleted = (deferredTransactionId: Transaction.Id, repayingTransferTransactionDocumentId: Transaction.Id) => {
  cy.log('Get transaction document', repayingTransferTransactionDocumentId)
    .getTransactionDocumentById(repayingTransferTransactionDocumentId)
    .should((currentDocument: Transaction.TransferDocument) => {
      const repayments = currentDocument.payments.filter(p => getTransactionId(p.transaction) === deferredTransactionId);

      expect(repayments).to.have.lengthOf(0, 'has no repayment');
    });
};

const validateRelatedRepaymentUnchanged = (deferredTransactionId: Transaction.Id, originalRepayingTransferTransactionDocument: Transaction.TransferDocument) => {
  cy.log('Get transaction document', getTransactionId(originalRepayingTransferTransactionDocument))
    .getTransactionDocumentById(getTransactionId(originalRepayingTransferTransactionDocument))
    .should((currentDocument: Transaction.TransferDocument) => {
      const { amount, transaction, ...empty } = currentDocument.payments.find(p => getTransactionId(p.transaction) === deferredTransactionId);
      const originalRepayment = originalRepayingTransferTransactionDocument.payments.find(p => getTransactionId(p.transaction) === deferredTransactionId);

      expect(amount, 'payment.amount').to.equals(originalRepayment.amount);
      expect(getTransactionId(transaction), 'payment.transactionId').to.equals(getTransactionId(originalRepayment.transaction));
      expectEmptyObject(empty, 'repayments');
    });
};

export const setTransferTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionTransferDocument,
    validateTransactionTransferResponse,
  });

  Cypress.Commands.addAll({
    validateRelatedRepaymentDeleted,
    validateRelatedRepaymentUnchanged,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateRelatedRepaymentDeleted: CommandFunction<typeof validateRelatedRepaymentDeleted>;
      validateRelatedRepaymentUnchanged: CommandFunction<typeof validateRelatedRepaymentUnchanged>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionTransferDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferDocument>;
      validateTransactionTransferResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferResponse>;
    }
  }
}
