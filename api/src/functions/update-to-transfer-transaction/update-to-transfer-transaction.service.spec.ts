import { IUpdateToTransferTransactionService, updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Requests } from '@household/shared/types/requests';

describe('Update to transfer transaction service', () => {
  let service: IUpdateToTransferTransactionService;
  let mockAccountService: MockService<IAccountService>;
  let mockTransactionService: MockService<ITransactionService>;
  let mockTransferTransactionDocumentConverter: MockService<ITransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountService = createMockService('findAccountsByIds');
    mockTransactionService = createMockService('updateTransaction', 'findTransactionById');
    mockTransferTransactionDocumentConverter = createMockService('update');

    service = updateToTransferTransactionServiceFactory(mockAccountService.service, mockTransactionService.service, mockTransferTransactionDocumentConverter.service);
  });

  const queriedAccount = testDataFactory.account.document();
  const queriedTransferAccount = testDataFactory.account.document();
  let body: Requests.TransferTransaction;
  const updateQuery = testDataFactory.documentUpdate();
  const queriedDocument = testDataFactory.transaction.document.payment();
  const transactionId = getTransactionId(queriedDocument);

  beforeEach(() => {
    body = testDataFactory.transaction.request.transfer({
      accountId: getAccountId(queriedAccount),
      transferAccountId: getAccountId(queriedTransferAccount),
    });
  });

  describe('should return', () => {
    it('if updated to transfer transaction between 2 loan accounts', async () => {
      const queriedLoanAccount1 = testDataFactory.account.document({
        accountType: AccountType.Loan,
      });
      const queriedLoanAccount2 = testDataFactory.account.document({
        accountType: AccountType.Loan,
      });
      body = testDataFactory.transaction.request.transfer({
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
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(4);
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
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(4);
    });

    it('if updated to transfer transaction between a loan and non-loan accounts', async () => {
      const queriedLoanAccount = testDataFactory.account.document({
        accountType: AccountType.Loan,
      });
      body = testDataFactory.transaction.request.transfer({
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
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(4);
    });
  });

  describe('should throw error', () => {
    it('if both accounts are the same', async () => {
      body = testDataFactory.transaction.request.transfer({
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
      expect.assertions(6);
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
      expect.assertions(6);
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
      expect.assertions(6);
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
      expect.assertions(6);
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
      expect.assertions(6);
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
      }, undefined);
      validateFunctionCall(mockTransactionService.functions.updateTransaction, transactionId, updateQuery);
      expect.assertions(6);
    });
  });
});
