import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountService } from '@household/shared/services/account-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProjectService } from '@household/shared/services/project-service';
import { IRecipientService } from '@household/shared/services/recipient-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface ICreateSplitTransactionService {
  (ctx: {
    body: Transaction.SplitRequest;
    expiresIn: number;
  }): Promise<string>;
}

export const createSplitTransactionServiceFactory = (
  accountService: IAccountService,
  projectService: IProjectService,
  categoryService: ICategoryService,
  recipientService: IRecipientService,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): ICreateSplitTransactionService => {
  return async ({ body, expiresIn }) => {
    const categoryIds = [...new Set(body.splits.map(s => s.categoryId).filter(s => s))];
    const projectIds = [...new Set(body.splits.map(s => s.projectId).filter(s => s))];

    const total = body.splits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);

    if (total !== body.amount) {
      throw httpError(400, 'Sum of splits must equal to total amount');
    }

    const [
      account,
      categories,
      projects,
      recipient,
    ] = await Promise.all([
      accountService.getAccountById(body.accountId),
      categoryService.listCategoriesByIds(categoryIds),
      projectService.listProjectsByIds(projectIds),
      recipientService.getRecipientById(body.recipientId),
    ]).catch((error) => {
      console.error('Unable to query related data', error, body);
      throw httpError(500, 'Unable to query related data');
    });

    if (!account) {
      console.error('No account found', body.accountId);
      throw httpError(400, 'No account found');
    }

    if (categoryIds.length !== categories.length) {
      console.error('Some of the categories are not found', categoryIds);
      throw httpError(400, 'Some of the categories are not found');
    }

    if (projectIds.length !== projects.length) {
      console.error('Some of the projects are not found', projectIds);
      throw httpError(400, 'Some of the projects are not found');
    }

    if (!recipient && body.recipientId) {
      console.error('No recipient found', body.recipientId);
      throw httpError(400, 'No recipient found');
    }

    const document = transactionDocumentConverter.createSplitDocument({
      body,
      account,
      recipient,
      categories,
      projects,
    }, expiresIn);

    const saved = await transactionService.saveTransaction(document).catch((error) => {
      console.error('Save transaction', error);
      throw httpError(500, 'Error while saving transaction');
    });

    return saved._id.toString();
  };
};
