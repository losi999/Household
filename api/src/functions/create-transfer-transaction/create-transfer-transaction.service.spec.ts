import { ICreateTransferTransactionService, createTransferTransactionServiceFactory } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { createTransferTransactionRequest, createAccountDocument, createTransferTransactionDocument } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Requests } from '@household/shared/types/requests';

describe('Create transfer transaction service', () => {
  let service: ICreateTransferTransactionService;
  let mockAccountService: MockService<IAccountService>;
  let mockTransactionService: MockService<ITransactionService>;
  let mockTransferTransactionDocumentConverter: MockService<ITransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('findAccountsByIds');
    mockTransactionService = createMockService('saveTransaction');
    mockTransferTransactionDocumentConverter = createMockService('create');

    service = createTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = createAccountDocument();
  const queriedTransferAccount = createAccountDocument();
  let body: Requests.TransferTransaction;
  const createdTransferDocument = createTransferTransactionDocument();

  beforeEach(() => {
    body = createTransferTransactionRequest({
      accountId: getAccountId(queriedAccount),
      transferAccountId: getAccountId(queriedTransferAccount),
    });
  });

  describe('should return new id', () => {
    it('of created transfer transaction between 2 loan accounts', async () => {
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

      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
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
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedLoanAccount1,
        transferAccount: queriedLoanAccount2,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      expect.assertions(4);
    });

    it('of created transfer transaction between 2 non-1oan accounts', async () => {
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
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
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      expect.assertions(4);
    });

    it('of created transfer transaction between a loan and non-loan accounts', async () => {
      const queriedLoanAccount = createAccountDocument({
        accountType: AccountType.Loan,
      });
      body = createTransferTransactionRequest({
        ...body,
        transferAccountId: getAccountId(queriedLoanAccount),
      });
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedLoanAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdTransferDocument);
      mockTransactionService.functions.saveTransaction.mockResolvedValue(createdTransferDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(getTransactionId(createdTransferDocument));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedLoanAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      expect.assertions(4);
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
      validateFunctionCall(mockAccountService.functions.findAccountsByIds);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
    });

    it('if unable to query accounts', async () => {
      mockAccountService.functions.findAccountsByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
    });

    it('if no account found', async () => {
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([]);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No account found', 400));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransaction);
      expect.assertions(5);
    });

    it('if unable to save transaction', async () => {
      mockAccountService.functions.findAccountsByIds.mockResolvedValue([
        queriedAccount,
        queriedTransferAccount,
      ]);
      mockTransferTransactionDocumentConverter.functions.create.mockReturnValue(createdTransferDocument);
      mockTransactionService.functions.saveTransaction.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving transaction', 500));
      validateFunctionCall(mockAccountService.functions.findAccountsByIds, [
        body.accountId,
        body.transferAccountId,
      ]);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.create, {
        body,
        account: queriedAccount,
        transferAccount: queriedTransferAccount,
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.saveTransaction, createdTransferDocument);
      expect.assertions(5);
    });
  });
});
