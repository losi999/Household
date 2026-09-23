import { httpErrors } from '@household/api/common/error-handlers';
import { IDraftTransactionDocumentConverter } from '@household/shared/converters/draft-transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IListTransactionsByFileService {
  (ctx: Api.File.FileId): Promise<Responses.DraftTransaction[]>;
}

export const listTransactionsByFileServiceFactory = (
  transactionService: ITransactionService,
  draftTransactionDocumentConverter: IDraftTransactionDocumentConverter): IListTransactionsByFileService => {
  return async ({ fileId }) => {
    const documents = await transactionService.listDraftTransactionsByFileId(fileId).catch(httpErrors.transaction.listByFileId({
      fileId,
    }));

    console.log('docs', JSON.stringify(documents, null, 2));

    return draftTransactionDocumentConverter.toResponseList(documents);
  };
};
