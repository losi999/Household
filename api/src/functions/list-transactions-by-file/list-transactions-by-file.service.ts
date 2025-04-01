import { httpErrors } from '@household/api/common/error-handlers';
import { IDraftTransactionDocumentConverter } from '@household/shared/converters/draft-transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { File, Transaction } from '@household/shared/types/types';

export interface IListTransactionsByFileService {
  (ctx: File.FileId): Promise<Transaction.DraftResponse[]>;
}

export const listTransactionsByFileServiceFactory = (
  transactionService: ITransactionService,
  draftTransactionDocumentConverter: IDraftTransactionDocumentConverter): IListTransactionsByFileService => {
  return async ({ fileId }) => {
    const documents = await transactionService.listDraftTransactionsByFileId(fileId).catch(httpErrors.transaction.listByFileId({
      fileId,
    }));

    console.log('docs', documents);

    return draftTransactionDocumentConverter.toResponseList(documents);
  };
};
