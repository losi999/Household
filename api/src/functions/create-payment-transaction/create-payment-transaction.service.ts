import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreatePaymentTransactionService {
  (ctx: {
    body: Transaction.PaymentRequest;
    expiresIn: number;
  }): Promise<string>;
}

export const createPaymentTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreatePaymentTransactionService => {
  return async ({ body, expiresIn }) => {
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
    ]).catch((error) => {
      console.error('Unable to query related data', error, body);
      throw httpError(500, 'Unable to query related data');
    });

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
      recipient,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch((error) => {
      console.error('Save transaction', error);
      throw httpError(500, 'Error while saving transaction');
    });

    return saved._id.toString();
  };
};
