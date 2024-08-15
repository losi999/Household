import { ICreateTransferTransactionService, createTransferTransactionServiceFactory } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument, createDeferredTransactionDocument, createLoanTransferTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

describe('Create transfer transaction service', () => {
  let service: ICreateTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransferTransactionDocumentConverter: Mock<ITransferTransactionDocumentConverter>;
  let mockLoanTransferTransactionDocumentConverter: Mock<ILoanTransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccountsByIds');
    mockTransactionService = createMockService('saveTransaction', 'listDeferredTransactions');
    mockTransferTransactionDocumentConverter = createMockService('create');
    mockLoanTransferTransactionDocumentConverter = createMockService('create');

    service = createTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service, mockLoanTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = createAccountDocument();
  const queriedTransferAccount = createAccountDocument();
  let body: Transaction.TransferRequest;
  const createdTransferDocument = createTransferTransactionDocument();
  const createdLoanTransferDocument = createLoanTransferTransactionDocument();

  beforeEach(() => {
    body = createTransferTransactionRequest({
      accountId: getAccountId(queriedAccount),
      transferAccountId: getAccountId(queriedTransferAccount),
    });
  });

  describe('should return new id', () => {
    it('of created transfer transaction between 2 loan accounts', async () => {
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

      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedLoanAccount1,
        queriedLoanAccount2,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdTransferDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdTransferDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdTransferDocument));
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(6);
    });

    it('of created transfer transaction between 2 non-1oan accounts', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdTransferDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdTransferDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdTransferDocument));
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(6);
    });

    it('of created transfer transaction between 2 non-1oan accounts with payments', async () => {
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
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([deferredTransactionDocument]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdTransferDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdTransferDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdTransferDocument));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
        transactions: toDictionary([deferredTransactionDocument], '_id'),
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      expect.assertions(6);
    });

    it('of created loan transfer transaction', async () => {
      const queriedLoanAccount = createAccountDocument({
        accountType: 'loan',
      });
      body = createTransferTransactionRequest({
        ...body,
        transferAccountId: getAccountId(queriedLoanAccount),
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockLoanTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdLoanTransferDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdLoanTransferDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdLoanTransferDocument));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedLoanAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdLoanTransferDocument);
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
        expiresIn: undefined,
      }).catch(validateError('Cannot transfer to same account', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if unable to query accounts', async () => {
      mockAccountService.functions.listAccountsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });

    it('if no account found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
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
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
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
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Some of the transactions are not found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions, {
        deferredTransactionIds: [getTransactionId(deferredTransactionDocument)],
      });
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      expect.assertions(7);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdTransferDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.listDeferredTransactions);
      expect.assertions(7);
    });
  });
});
