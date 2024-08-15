import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { File, Transaction } from '@household/shared/types/types';

export interface IDraftTransactionDocumentConverter {
  create(data: {
    body: Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description;
    file: File.Document;
  }, expiresIn: number, generateId?: boolean): Transaction.DraftDocument;
}

export const draftTransactionDocumentConverterFactory = (): IDraftTransactionDocumentConverter => {

  const instance: IDraftTransactionDocumentConverter = {
    create: ({ body, file }, expiresIn, generateId): Transaction.DraftDocument => {
      return {
        ...body,
        file,
        transactionType: 'draft',
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
  };

  return instance;
};
