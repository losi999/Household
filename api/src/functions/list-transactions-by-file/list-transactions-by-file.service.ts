import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { File, Transaction } from '@household/shared/types/types';

export interface IListTransactionsByFileService {
  (ctx: File.FileId): Promise<Transaction.Response[]>;
}

export const listTransactionsByFileServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsByFileService => {
  return async ({ fileId }) => {
    const documents = await transactionService.listDraftTransactionsByFileId(fileId).catch(httpErrors.transaction.listByFileId({
      fileId,
    }));

    console.log('docs', documents);

    return transactionDocumentConverter.toResponseList(documents);
  };
};
