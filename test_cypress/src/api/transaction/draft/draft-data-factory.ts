import { draftTransactionDocumentConverter } from '@household/shared/dependencies/converters/draft-transaction-document-converter';
import { File, Transaction } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';

export const draftTransactionDataFactory = (() => {
  const createDraftTransactionDocument = (ctx: {
    body?: Pick<Transaction.DraftDocument, 'amount' | 'description' | 'issuedAt'>;
    file: File.Document;
  }): Transaction.DraftDocument => {
    return draftTransactionDocumentConverter.create({
      body: {
        amount: faker.number.float(),
        description: faker.word.words({
          count: {
            min: 1,
            max: 5,
          },
        }),
        issuedAt: faker.date.recent(),
        ...ctx.body,
      },
      file: ctx.file,
    }, Cypress.env('EXPIRES_IN'), true);
  };

  return {
    document: createDraftTransactionDocument,
    id: (createId<Transaction.Id>),
  };
})();
