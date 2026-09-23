import { draftTransactionDocumentConverter } from '@household/shared/dependencies/converters/draft-transaction-document-converter';
import { Documents } from '@household/shared/types/documents';
import { faker } from '@faker-js/faker';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const draftTransactionDataFactory = (() => {
  const createDraftTransactionDocument = (ctx: {
    body?: Pick<Documents.DraftTransaction, 'amount' | 'description' | 'issuedAt'>;
    file: Documents.File;
  }): Documents.DraftTransaction => {
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
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    document: createDraftTransactionDocument,
    id: testDataFactory.transaction.id,
  };
})();
