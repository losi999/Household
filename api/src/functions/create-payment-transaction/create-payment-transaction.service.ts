import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreatePaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    expiresIn: number;
  }): Promise<string>;
}

export const createPaymentTransactionServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreatePaymentTransactionService => {
  return async ({ body, expiresIn }) => {
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

    const document = transactionDocumentConverter.createPaymentDocument({
      body,
      account,
      category,
      project,
      recipient
    }, expiresIn);

    const saved = await databaseService.saveTransaction(document).catch((error) => {
      console.error('Save transaction', error);
      throw httpError(500, 'Error while saving transaction');
    });

    return saved._id.toString();
  };
};
