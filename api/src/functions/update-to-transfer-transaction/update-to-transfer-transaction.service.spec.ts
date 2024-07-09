import { IUpdateToTransferTransactionService, updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument, createPaymentTransactionDocument, createLoanTransferTransactionDocument, createDeferredTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

describe('Update to transfer transaction service', () => {
  let service: IUpdateToTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransferTransactionDocumentConverter: Mock<ITransferTransactionDocumentConverter>;
  let mockLoanTransferTransactionDocumentConverter: Mock<ILoanTransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccountsByIds');
    mockTransactionService = createMockService('replaceTransaction', 'getTransactionById', 'listDeferredTransactions');
    mockTransferTransactionDocumentConverter = createMockService('create');
    mockLoanTransferTransactionDocumentConverter = createMockService('create');

    service = updateToTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service, mockLoanTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = createAccountDocument();
  const queriedTransferAccount = createAccountDocument();
  let body: Transaction.TransferRequest;
  const updatedTransferDocument = createTransferTransactionDocument({
    description: 'updated',
  });
  const updatedLoanTransferDocument = createLoanTransferTransactionDocument({
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
        accountType: 'loan',
      });
      const queriedLoanAccount2 = createAccountDocument({
        accountType: 'loan',
      });
      body = createTransferTransactionRequest({
        ...body,
        accountId: getAccountId(queriedLoanAccount1),
        transferAccountId: getAccountId(queriedLoanAccount2),
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedLoanAccount1,
        queriedLoanAccount2,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedTransferDocument);
      mockTransactionService.functions.replaceTransaction.mockResolvedValue(undefined);

      const { _id, ...docToSave } = updatedTransferDocument;

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedLoanAccount1,
        transferAccount: queriedLoanAccount2,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, docToSave);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(6);
    });

    it('if updated to transfer transaction between 2 non-1oan accounts', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedTransferDocument);
      mockTransactionService.functions.replaceTransaction.mockResolvedValue(undefined);

      const { _id, ...docToSave } = updatedTransferDocument;

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, docToSave);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(6);
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

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([deferredTransactionDocument]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedTransferDocument);
      mockTransactionService.functions.replaceTransaction.mockResolvedValue(undefined);

      const { _id, ...docToSave } = updatedTransferDocument;

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        payingAccountIds: [getAccountId(queriedTransferAccount)],
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: toDictionary([deferredTransactionDocument], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, docToSave);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      expect.assertions(6);
    });

    it('if updated to loan transfer transaction', async () => {
      const queriedLoanAccount = createAccountDocument({
        accountType: 'loan',
      });
      body = createTransferTransactionRequest({
        ...body,
        transferAccountId: getAccountId(queriedLoanAccount),
      });

      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockLoanTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedLoanTransferDocument);
      mockTransactionService.functions.replaceTransaction.mockResolvedValue(undefined);

      const { _id, ...docToSave } = updatedLoanTransferDocument;

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedLoanAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, docToSave);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(6);
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
      validateFunctionCall(mockTransactionService.functions.getTransactionById);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(8);
    });

    it('if unable to query transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(8);
    });

    it('if no transaction found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(undefined);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No transaction found', 404));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(8);
    });

    it('if unable to query accounts', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(8);
    });

    it('if no account found', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(8);
    });

    it('if sum of payments is larger than total amount', async () => {
      const deferredTransactionDocument = createDeferredTransactionDocument({
        payingAccount: queriedTransferAccount,
      });

      body = createTransferTransactionRequest({
        ...body,
        amount: -1000,
        transferAmount: 1000,
        payments: [
          {
            amount: 10000,
            transactionId: getTransactionId(deferredTransactionDocument),
          },
        ],
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Sum of payments must be less than total amount', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      expect.assertions(8);
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
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockRejectedValue('this is a mongo error');

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        payingAccountIds: [getAccountId(queriedTransferAccount)],
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      expect.assertions(8);
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
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Some of the transactions are not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        payingAccountIds: [getAccountId(queriedTransferAccount)],
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
        excludedTransferTransactionId: transactionId,
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      expect.assertions(8);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedTransferDocument);
      mockTransactionService.functions.replaceTransaction.mockRejectedValue('this is a mongo error');
      const { _id, ...docToSave } = updatedTransferDocument;

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: undefined,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.replaceTransaction, transactionId, docToSave);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(8);
    });
  });
});
