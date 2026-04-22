import { Transaction } from '@household/shared/types/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';

export const test = baseTest.extend<Pick<ITransactionService, 'saveTransaction' | 'saveTransactions' | 'findTransactionById' | 'getTransactionById' | 'listDraftTransactionsByFileId'>>({
  saveTransaction: async ({ logDbCall }, use) => {
    const saveTransaction: ITransactionService['saveTransaction'] = async (transaction) => {
      const result = await transactionService.saveTransaction(transaction);
      await logDbCall('saveTransaction', {
        transaction,
      }, result);
      return result;
    };

    await use(saveTransaction);
  },
  saveTransactions: async ({ logDbCall }, use) => {
    const saveTransactions: ITransactionService['saveTransactions'] = async (...transactions) => {
      const result = await transactionService.saveTransactions(...transactions);
      await logDbCall('saveTransactions', {
        transactions,
      }, result);
      return result;
    };

    await use(saveTransactions);
  },
  findTransactionById: async ({ logDbCall }, use) => {
    const findTransactionById: ITransactionService['findTransactionById'] = async <T extends Transaction.Document = Transaction.Document>(transactionId: Parameters<ITransactionService['findTransactionById']>[0]) => {
      const result = await transactionService.findTransactionById<T>(transactionId);
      await logDbCall('findTransactionById', {
        transactionId,
      }, result);
      return result;
    };

    await use(findTransactionById);
  },
  getTransactionById: async ({ logDbCall }, use) => {
    const getTransactionById: ITransactionService['getTransactionById'] = async <T extends Transaction.Document = Transaction.Document>(transactionId: Transaction.Id) => {
      const result = await transactionService.getTransactionById<T>(transactionId);
      await logDbCall('getTransactionById', {
        transactionId,
      }, result);
      return result;
    };

    await use(getTransactionById);
  },
  listDraftTransactionsByFileId: async ({ logDbCall }, use) => {
    const listDraftTransactionsByFileId: ITransactionService['listDraftTransactionsByFileId'] = async (fileId) => {
      const result = await transactionService.listDraftTransactionsByFileId(fileId);
      await logDbCall('listDraftTransactionsByFileId', {
        fileId,
      }, result);
      return result;
    };

    await use(listDraftTransactionsByFileId);
  },
});
