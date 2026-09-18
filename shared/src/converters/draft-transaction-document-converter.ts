import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getTransactionId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { TransactionType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Responses } from '@household/shared/types/responses';

export interface IDraftTransactionDocumentConverter {
  create(data: {
    body: Api.Transaction.IssuedAt<Date> & Api.Transaction.Amount & Api.Transaction.Description;
    file: Documents.File;
  }, expiresIn: number, generateId?: boolean): Documents.DraftTransaction;
  toResponse(document: Documents.DraftTransaction): Responses.DraftTransaction;
  toResponseList(documents: Documents.DraftTransaction[]): Responses.DraftTransaction[]
}

export const draftTransactionDocumentConverterFactory = (transactionDocumentConverter: ITransactionDocumentConverter): IDraftTransactionDocumentConverter => {

  const instance: IDraftTransactionDocumentConverter = {
    create: ({ body, file }, expiresIn, generateId): Documents.DraftTransaction => {
      return {
        ...body,
        file,
        transactionType: TransactionType.Draft,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: ({ amount, description, issuedAt, _id, potentialDuplicates }) => {
      return {
        amount,
        description,
        potentialDuplicates: transactionDocumentConverter.toResponseList(potentialDuplicates),
        issuedAt: issuedAt.toISOString(),
        transactionId: getTransactionId(_id),
        transactionType: TransactionType.Draft,
      };
    },
    toResponseList: (documents) => documents.map(d => instance.toResponse(d)),
  };

  return instance;
};
