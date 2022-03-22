import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToPaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    transactionId: Transaction.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToPaymentTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): IUpdateToPaymentTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const document = await transactionService.getTransactionById(transactionId).catch((error) => {
      console.error('Get transaction', error);
      throw httpError(500, 'Error while getting transaction');
    });

    if (!document) {
      throw httpError(404, 'No transaction found');
    }

    const [
      account,
      category,
      project,
      recipient,
    ] = await Promise.all([
      accountService.getAccountById(body.accountId),
      categoryService.getCategoryById(body.categoryId),
      projectService.getProjectById(body.projectId),
      recipientService.getRecipientById(body.recipientId),
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

    await transactionService.updateTransaction(updated).catch((error) => {
      console.error('Update transaction', error);
      throw httpError(500, 'Error while updating transaction');
    });
  };
};
