import { ICreateTransferTransactionService, createTransferTransactionServiceFactory } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument, createAccountId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Types } from 'mongoose';

describe('Create transfer transaction service', () => {
  let service: ICreateTransferTransactionService;
  let mockAccountService: Mock<IAccountService>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('listAccountsByIds');
    mockTransactionService = createMockService('saveTransaction');
    mockTransactionDocumentConverter = createMockService('createTransferDocument');

    service = createTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
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
  const transactionId = new Types.ObjectId();
  const createdDocument = createTransferTransactionDocument({
    _id: transactionId,
  });

  describe('should return new id', () => {
    it('if every body property is filled', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionDocumentConverter.functions.createTransferDocument.mockReturnValue(createdDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createTransferDocument, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
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
        expiresIn: undefined,
      }).catch(validateError('Cannot transfer to same account', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createTransferDocument);
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
      validateFunctionCall(mockTransactionDocumentConverter.functions.createTransferDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
    });

    it('if no account found', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([ ]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('One of the accounts is not found', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createTransferDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
    });

    it('if accounts are in different currency', async () => {
      const otherCurrencyAccount = createAccountDocument({
        _id: transferAccountId,
        currency: '$',
      });
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        otherCurrencyAccount,
      ]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Accounts must be in the same currency', 400));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createTransferDocument);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.listAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransactionDocumentConverter.functions.createTransferDocument.mockReturnValue(createdDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
      validateFunctionCall(mockAccountService.functions.listAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransactionDocumentConverter.functions.createTransferDocument, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdDocument);
      expect.assertions(5);
    });
  });
});
