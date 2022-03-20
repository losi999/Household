import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToPaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    transactionId: Transaction.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToPaymentTransactionServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): IUpdateToPaymentTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const document = await databaseService.getTransactionById(transactionId).catch((error) => {
      console.error('Get transaction', error);
      throw httpError(500, 'Error while getting transaction');
    });

    if (!document) {
      throw httpError(404, 'No transaction found');
    }

    const [account, category, project, recipient] = await Promise.all([
      databaseService.getAccountById(body.accountId),
      databaseService.getCategoryById(body.categoryId),
      databaseService.getProjectById(body.projectId),
      databaseService.getRecipientById(body.recipientId),
    ]);

    if (!account) {
      console.error('No account found', body.accountId);
      throw httpError(400, 'No account found');
    }

    if (!category && body.categoryId) {
      console.error('No category found', body.categoryId);
      throw httpError(400, 'No category found');
    }

    if (!project && body.projectId) {
      console.error('No project found', body.projectId);
      throw httpError(400, 'No project found');
    }

    if (!recipient && body.recipientId) {
      console.error('No recipient found', body.recipientId);
      throw httpError(400, 'No recipient found');
    }

    const updated = transactionDocumentConverter.updatePaymentDocument({
      body,
      account,
      project,
      category,
      recipient,
      document,
    }, expiresIn);

    await databaseService.updateTransaction(updated).catch((error) => {
      console.error('Update transaction', error);
      throw httpError(500, 'Error while updating transaction');
    });
  };
};
