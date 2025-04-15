import { generateMongoId, getTransactionId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { TransactionType } from '@household/shared/enums';
import { File, Transaction } from '@household/shared/types/types';

export interface IDraftTransactionDocumentConverter {
  create(data: {
    body: Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description;
    file: File.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.DraftDocument;
  toResponse(document: Transaction.DraftDocument): Transaction.DraftResponse;
  toResponseList(documents: Transaction.DraftDocument[]): Transaction.DraftResponse[]
}

export const draftTransactionDocumentConverterFactory = (): IDraftTransactionDocumentConverter => {

  const instance: IDraftTransactionDocumentConverter = {
    create: ({ body, file }, expiresIn, generateId): Transaction.DraftDocument => {
      return {
        ...body,
        file,
        transactionType: TransactionType.Draft,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: ({ amount, description, issuedAt, _id, hasDuplicate }) => {
      return {
        amount,
        description,
        hasDuplicate,
        issuedAt: issuedAt.toISOString(),
        transactionId: getTransactionId(_id),
        transactionType: TransactionType.Draft,
      };
    },
    toResponseList: (documents) => documents.map(d => instance.toResponse(d)),
  };

  return instance;
};
