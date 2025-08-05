import { IUpdateToTransferTransactionService, updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createPaymentTransactionDocument, createDeferredTransactionDocument, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

describe('Update to transfer transaction service', () => {
  let service: IUpdateToTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransferTransactionDocumentConverter: Mock<ITransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('findAccountsByIds');
    mockTransactionService = createMockService('updateTransaction', 'findTransactionById', 'listDeferredTransactions');
    mockTransferTransactionDocumentConverter = createMockService('update');

    service = updateToTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = createAccountDocument();
  const queriedTransferAccount = createAccountDocument();
  let body: Transaction.TransferRequest;
  const updateQuery = createDocumentUpdate({
    description: 'updated',
  });
  const queriedDocument = createPaymentTransactionDocument();
  const transactionId = getTransactionId(queriedDocument);

  beforeEach(() => {
    body = createTransferTransactionRequest({
      accountId: getAccountId(queriedAccount),
      transferAccountId: getAccountId(queriedTransferAccount),
    });
  });

  describe('should return', () => {
    it('if updated to transfer transaction between 2 loan accounts', async () => {
      const queriedLoanAccount1 = createAccountDocument({
        accountType: AccountType.Loan,
      });
      const queriedLoanAccount2 = createAccountDocument({
        accountType: AccountType.Loan,
      });
      body = createTransferTransactionRequest({
        ...body,
        accountId: getAccountId(queriedLoanAccount1),
        transferAccountId: getAccountId(queriedLoanAccount2),
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedLoanAccount1,
        queriedLoanAccount2,
      ]);
      mockTransferTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update, {
        body,
        account: queriedLoanAccount1,
        transferAccount: queriedLoanAccount2,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(5);
    });

    it('if updated to transfer transaction between 2 non-1oan accounts', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(5);
    });

    it('if updated to transfer transaction between 2 non-1oan accounts with payments', async () => {
      const deferredTransactionDocument = createDeferredTransactionDocument({
        payingAccount: queriedTransferAccount,
      });

      body = createTransferTransactionRequest({
        ...body,
        amount: -1000,
        transferAmount: 1000,
        payments: [
          {
            amount: 100,
            transactionId: getTransactionId(deferredTransactionDocument),
          },
        ],
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([deferredTransactionDocument]);
      mockTransferTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: toDictionary([deferredTransactionDocument], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(5);
    });

    it('if updated to transfer transaction between a loan and non-loan accounts', async () => {
      const queriedLoanAccount = createAccountDocument({
        accountType: AccountType.Loan,
      });
      body = createTransferTransactionRequest({
        ...body,
        transferAccountId: getAccountId(queriedLoanAccount),
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update, {
        body,
        account: queriedAccount,
        transferAccount: queriedLoanAccount,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(5);
    });

    it('if updated to transfer transaction between a loan and non-loan accounts with payments', async () => {
      const deferredTransactionDocument = createDeferredTransactionDocument({
        payingAccount: queriedTransferAccount,
      });
     
      const queriedLoanAccount = createAccountDocument({
        accountType: AccountType.Loan,
      });
      body = createTransferTransactionRequest({
        ...body,
        transferAccountId: getAccountId(queriedLoanAccount),
        amount: -1000,
        transferAmount: 1000,
        payments: [
          {
            amount: 100,
            transactionId: getTransactionId(deferredTransactionDocument),
          },
        ],
      });

      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([deferredTransactionDocument]);
      mockTransferTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update, {
        body,
        account: queriedAccount,
        transferAccount: queriedLoanAccount,
        transactions: toDictionary([deferredTransactionDocument], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(5);
    });
  });

  describe('should throw error', () => {
    it('if both accounts are the same', async () => {
      body = createTransferTransactionRequest({
        ...body,
        accountId: getAccountId(queriedAccount),
        transferAccountId: getAccountId(queriedAccount),
      });

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Cannot transfer to same account', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if unable to query transaction', async () => {
      mockTransactionService.functions.findTransactionById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting transaction', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if no transaction found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No transaction found', 404));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if unable to query accounts', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if no account found', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if unable to query deferred transactions', async () => {
      const deferredTransactionDocument = createDeferredTransactionDocument({
        payingAccount: queriedTransferAccount,
      });

      body = createTransferTransactionRequest({
        ...body,
        amount: -1000,
        transferAmount: 1000,
        payments: [
          {
            amount: 100,
            transactionId: getTransactionId(deferredTransactionDocument),
          },
        ],
      });
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(7);
    });

    it('if a deferred transaction is not found', async () => {
      const deferredTransactionDocument = createDeferredTransactionDocument({
        payingAccount: queriedTransferAccount,
      });

      body = createTransferTransactionRequest({
        ...body,
        amount: -1000,
        transferAmount: 1000,
        payments: [
          {
            amount: 100,
            transactionId: getTransactionId(deferredTransactionDocument),
          },
        ],
      });
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the transactions are not found', 400));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(7);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.findTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.findTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.update, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });
  });
});
