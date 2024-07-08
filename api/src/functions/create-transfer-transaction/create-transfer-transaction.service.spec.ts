import { ICreateTransferTransactionService, createTransferTransactionServiceFactory } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('Create transfer transaction service', () => {
  let service: ICreateTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransferTransactionDocumentConverter: Mock<ITransferTransactionDocumentConverter>;
  let mockLoanTransferTransactionDocumentConverter: Mock<ILoanTransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccountsByIds');
    mockTransactionService = createMockService('saveTransaction');
    mockTransferTransactionDocumentConverter = createMockService('create');
    mockLoanTransferTransactionDocumentConverter = createMockService('create');

    service = createTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service, mockLoanTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = createAccountDocument();
  const queriedTransferAccount = createAccountDocument();
  const body = createTransferTransactionRequest({
    accountId: getAccountId(queriedAccount),
    transferAccountId: getAccountId(queriedTransferAccount),
  });
  const createdDocument = createTransferTransactionDocument();
  const transactionId = getTransactionId(createdDocument);

  describe('should return new id', () => {
    it('if every body property is filled', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(transactionId.toString());
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(4);
    });
  });

  describe('should throw error', () => {
    it('if both accounts are the same', async () => {
      const modifiedBody = createTransferTransactionRequest({
        accountId: getAccountId(queriedAccount),
        transferAccountId: getAccountId(queriedAccount),
      });

      await service({
        body: modifiedBody,
        expiresIn: undefined,
      }).catch(validateError('Cannot transfer to same account', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
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
      expect.assertions(5);
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
      expect.assertions(5);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdDocument);
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
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(5);
    });
  });
});
