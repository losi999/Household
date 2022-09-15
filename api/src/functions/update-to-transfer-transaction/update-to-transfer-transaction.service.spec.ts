import { IUpdateToTransferTransactionService, updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument, createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Types } from 'mongoose';

describe('Update to transfer transaction service', () => {
  let service: IUpdateToTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccountsByIds');
    mockTransactionService = createMockService('updateTransaction', 'getTransactionById');
    mockTransactionDocumentConverter = createMockService('updateTransferDocument');

    service = updateToTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const accountId = new Types.ObjectId();
  const transferAccountId = new Types.ObjectId();
  const body = createTransferTransactionRequest({
    accountId: createAccountId(accountId.toString()),
    transferAccountId: createAccountId(transferAccountId.toString()),
  });
  const queriedAccount = createAccountDocument({
    _id: accountId,
  });
  const queriedTransferAccount = createAccountDocument({
    _id: transferAccountId,
  });
  const transactionId = createTransactionId();
  const queriedDocument = createTransferTransactionDocument();
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
      mockTransactionDocumentConverter.functions.updateTransferDocument.mockReturnValue(updatedDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument, {
        body,
        document: queriedDocument,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(4);
    });
  });

  describe('should throw error', () => {
    it('if both accounts are the same', async () => {
      const modifiedBody = createTransferTransactionRequest({
        accountId: createAccountId(accountId.toString()),
        transferAccountId: createAccountId(accountId.toString()),
      });

      await service({
        body: modifiedBody,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Cannot transfer to same account', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument);
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
      }).catch(validateError('One of the accounts is not found', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
    });

    it('if accounts are in different currency', async () => {
      const otherCurrencyAccount = createAccountDocument({
        _id: transferAccountId,
        currency: '$',
      });
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        otherCurrencyAccount,
      ]);

      await service({
        body,
        transactionId,
        expiresIn: undefined,
      }).catch(validateError('Accounts must be in the same currency', 400));
      validateFunctionCall(mockTransactionService.functions.getTransactionById, transactionId);
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument);
      validateFunctionCall(mockTransactionService.functions.updateTransaction);
      expect.assertions(6);
    });

    it('if unable to update transaction', async () => {
      mockTransactionService.functions.getTransactionById.mockResolvedValue(queriedDocument);
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionDocumentConverter.functions.updateTransferDocument.mockReturnValue(updatedDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.updateTransferDocument, {
        body,
        document: queriedDocument,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, updatedDocument);
      expect.assertions(6);
    });
  });
});
