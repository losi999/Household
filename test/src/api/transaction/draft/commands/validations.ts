import { File, Import, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getFileId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { TransactionType } from '@household/shared/enums';
import { validateCommonResponse } from '@household/test/api/transaction/common/commands/validations';

const validateImportedRevolutDraftDocuments = (fileId: File.Id, ...rows: Import.Revolut[]) => {
  cy.log('Get draft documents by file', fileId)
    .listDraftTransactionsByFileId(fileId)
    .should((documents) => {
      expect(documents.length, 'number of items').to.equal(rows?.length);

      documents.forEach((document, index) => {
        const { amount, description, issuedAt, transactionType, file, hasDuplicate, ...internal } = document;
        const row = rows.find(r => description.includes(r.Type));

        expect(amount, `[${index}].amount`).to.equal(row.Amount - row.Fee);
        expect(issuedAt.toISOString().split('.')[0], `[${index}].issuedAt`).to.equal(row['Started Date'].toISOString()
          .split('.')[0]);
        expect(transactionType, `[${index}].transactionType`).to.equal(TransactionType.Draft);
        expect(description, `[${index}].description`).to.equal(`${row.Type} ${row.Description} ${row.Currency}`);
        expect(getFileId(file), `[${index}].fileId`).to.equal(fileId);
        expect(hasDuplicate, `[${index}].hasDuplicate`).to.be.false;

        expectRemainingProperties(internal);
      });
    });
};

const validateImportedOtpDraftDocuments = (fileId: File.Id, ...rows: Import.Otp[]) => {
  cy.log('Get draft documents by file', fileId)
    .listDraftTransactionsByFileId(fileId)
    .should((documents) => {
      expect(documents.length, 'number of items').to.equal(rows?.length);

      documents.forEach((document, index) => {
        const { amount, description, issuedAt, transactionType, file, hasDuplicate, ...internal } = document;
        const row = rows.find(r => description.includes(r['Forgalom típusa']));

        expect(amount, `[${index}].amount`).to.equal(row.Összeg);
        expect(issuedAt.toISOString().split('.')[0], `[${index}].issuedAt`).to.equal(row['Tranzakció időpontja'].toISOString().split('.')[0]);
        expect(transactionType, `[${index}].transactionType`).to.equal(TransactionType.Draft);
        expect(description, `[${index}].description`).to.equal(`${row['Forgalom típusa']} ${row['Ellenoldali név']} ${row.Közlemény}`);
        expect(getFileId(file), `[${index}].fileId`).to.equal(fileId);
        expect(hasDuplicate, `[${index}].hasDuplicate`).to.be.false;

        expectRemainingProperties(internal);
      });
    });
};

const validateImportedErsteDraftDocuments = (fileId: File.Id, ...rows: Import.Erste[]) => {
  cy.log('Get draft documents by file', fileId)
    .listDraftTransactionsByFileId(fileId)
    .should((documents) => {
      expect(documents.length, 'number of items').to.equal(rows?.length);

      documents.forEach((document, index) => {
        const { amount, description, issuedAt, transactionType, file, hasDuplicate, ...internal } = document;
        const row = rows.find(r => description.includes(r['Kategória']));

        expect(amount, `[${index}].amount`).to.equal(row.Összeg);
        expect(issuedAt.toISOString().split('.')[0], `[${index}].issuedAt`).to.equal(row['Dátum'].toISOString().split('.')[0]);
        expect(transactionType, `[${index}].transactionType`).to.equal(TransactionType.Draft);
        expect(description, `[${index}].description`).to.equal(`${row['Partner név']} ${row.Közlemény} ${row['Kategória']}`);
        expect(getFileId(file), `[${index}].fileId`).to.equal(fileId);
        expect(hasDuplicate, `[${index}].hasDuplicate`).to.be.false;

        expectRemainingProperties(internal);
      });
    });
};

const validateTransactionDraftListResponse = (responses: Transaction.DraftResponse[], ...documents: {
  document: Transaction.DraftDocument;
  duplicateTransaction?: Transaction.Document;
}[]) => {
  expect(responses.length, 'number of items').to.equal(documents.length);
  documents.forEach(({ document, duplicateTransaction }) => {
    const response = responses.find(t => t.transactionId === getTransactionId(document));

    const { transactionId, amount, issuedAt, transactionType, description, hasDuplicate, ...empty } = response;

    validateCommonResponse({
      amount,
      description,
      issuedAt,
      transactionId,
      transactionType,
    }, document);

    expect(hasDuplicate, 'hasDuplicate').to.equal(!!duplicateTransaction);

    expectEmptyObject(empty, 'response');
  });

};

export const setDraftTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionDraftListResponse,
  });

  Cypress.Commands.addAll({
    validateImportedRevolutDraftDocuments,
    validateImportedOtpDraftDocuments,
    validateImportedErsteDraftDocuments,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateImportedRevolutDraftDocuments: CommandFunction<typeof validateImportedRevolutDraftDocuments>;
      validateImportedOtpDraftDocuments: CommandFunction<typeof validateImportedOtpDraftDocuments>;
      validateImportedErsteDraftDocuments: CommandFunction<typeof validateImportedErsteDraftDocuments>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionDraftListResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionDraftListResponse>;
    }
  }
}
