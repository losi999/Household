import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Transaction } from '@household/shared/types/types';

export interface IUpdateToSplitTransactionService {
  (ctx: {
    body: Transaction.SplitRequest;
    transactionId: Transaction.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateToSplitTransactionServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter,
): IUpdateToSplitTransactionService => {
  return async ({ body, transactionId, expiresIn }) => {
    const document = await databaseService.getTransactionById(transactionId).catch((error) => {
      console.error('Get transaction', error);
      throw httpError(500, 'Error while getting transaction');
    });

    if (!document) {
      throw httpError(404, 'No transaction found');
    }

    const categoryIds = [...new Set(body.splits.map(s => s.categoryId).filter(s => s))];
    const projectIds = [...new Set(body.splits.map(s => s.projectId).filter(s => s))];

    const total = body.splits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount
    }, 0);

    if (total !== body.amount) {
      throw httpError(400, 'Sum of splits must equal to total amount');
    }

    const [account, categories, projects, recipient] = await Promise.all([
      databaseService.getAccountById(body.accountId),
      databaseService.listCategoriesByIds(categoryIds),
      databaseService.listProjectsByIds(projectIds),
      databaseService.getRecipientById(body.recipientId),
    ]);

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

    const updated = transactionDocumentConverter.updateSplitDocument({
      body,
      account,
      projects,
      categories,
      recipient,
      document,
    }, expiresIn);

    await databaseService.updateTransaction(updated).catch((error) => {
      console.error('Update transaction', error);
      throw httpError(500, 'Error while updating transaction');
    });
  };
};
