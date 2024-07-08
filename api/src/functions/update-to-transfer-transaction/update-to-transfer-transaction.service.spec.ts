import { IUpdateToTransferTransactionService, updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('Update to transfer transaction service', () => {
  let service: IUpdateToTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransferTransactionDocumentConverter: Mock<ITransferTransactionDocumentConverter>;
  let mockLoanTransferTransactionDocumentConverter: Mock<ILoanTransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccountsByIds');
    mockTransactionService = createMockService('updateTransaction', 'getTransactionById');
    mockTransferTransactionDocumentConverter = createMockService('create');
    mockLoanTransferTransactionDocumentConverter = createMockService('create');

    service = updateToTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service, mockLoanTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = createAccountDocument();
  const queriedTransferAccount = createAccountDocument();
  const body = createTransferTransactionRequest({
    accountId: getAccountId(queriedAccount),
    transferAccountId: getAccountId(queriedTransferAccount),
  });
  const queriedDocument = createTransferTransactionDocument();
  const transactionId = getTransactionId(queriedDocument);
  const updatedDocument = createTransferTransactionDocument({
    description: 'updated',
  });

  describe('should return', () => {
    it('if every body property is filled', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockResolvedValue(undefined);

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
      // validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
      //   body,
      //   document: queriedDocument,
      //   account: queriedAccount,
      //   transferAccount: queriedTransferAccount,
      // }, undefined);
      // validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
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
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Cannot transfer to same account', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
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
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
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
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
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
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
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
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(updatedDocument);
      mockTransactionService.functions.updateTransaction.mockRejectedValue('this is a mongo error');

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
      // validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
      //   body,
      //   document: queriedDocument,
      //   account: queriedAccount,
      //   transferAccount: queriedTransferAccount,
      // }, undefined);
      // validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(6);
    });
  });
});
