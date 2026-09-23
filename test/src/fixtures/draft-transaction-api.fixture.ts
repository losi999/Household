import { Api } from '@household/shared/types/api';
import { APIResponse, expect as baseExpect } from '@playwright/test';
import { TransactionType } from '@household/shared/enums';
import { Comparer } from '@household/test/comparer';
import { getTransactionId } from '@household/shared/common/utils';
import { validatePaymentTransactionResponse } from '@household/test/fixtures/payment-transaction-api.fixture';
import { validateDeferredTransactionResponse } from '@household/test/fixtures/deferred-transaction-api.fixture';
import { validateReimbursementTransactionResponse } from '@household/test/fixtures/reimbursement-transaction-api.fixture';
import { validateSplitTransactionResponse } from '@household/test/fixtures/split-transaction-api.fixture';
import { validateTransferTransactionResponse } from '@household/test/fixtures/transfer-transaction-api.fixture';
import { Import } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Responses } from '@household/shared/types/responses';

export const expect = baseExpect.extend({
  toHaveBeenImportedFromRevolutFile(draftTransactions: Documents.DraftTransaction[], fileId: Api.File.Id, ...revolutRows: Import.Revolut[]) {

    const errors = draftTransactions.flatMap((document, index) => {
      const row = revolutRows.find(r => document.description.includes(r.Type));
      
      const expectedIssuedAt = row?.['Started Date'];
      expectedIssuedAt.setMilliseconds(0);

      const comparer = new Comparer(document, {
        amount: row?.Amount - row?.Fee,
        issuedAt: expectedIssuedAt.toISOString(),
        transactionType: TransactionType.Draft,
        description: `${row?.Type} ${row?.Description} ${row?.Currency}`,
        file: fileId,
      }, '_id', 'expiresAt', 'createdAt', 'updatedAt', 'potentialDuplicates');

      return comparer.validate(`[${index}].`);
    });

    return {
      pass: errors.length === 0,
      message: () => `Expected draft transactions to have been imported from Revolut file:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenImportedFromOtpFile(draftTransactions: Documents.DraftTransaction[], fileId: Api.File.Id, ...otpRows: Import.Otp[]) {
    const errors = draftTransactions.flatMap((document, index) => {
      const row = otpRows.find(r => document.description.includes(r['Forgalom típusa']));
      
      const expectedIssuedAt = row?.['Tranzakció időpontja'];
      expectedIssuedAt.setMilliseconds(0);

      const comparer = new Comparer(document, {
        amount: row?.Összeg,
        issuedAt: expectedIssuedAt.toISOString(),
        transactionType: TransactionType.Draft,
        description: `${row?.['Forgalom típusa']} ${row?.['Ellenoldali név']} ${row?.Közlemény}`,
        file: fileId,
      }, '_id', 'expiresAt', 'createdAt', 'updatedAt', 'potentialDuplicates');

      return comparer.validate(`[${index}].`);
    });

    return {
      pass: errors.length === 0,
      message: () => `Expected draft transactions to have been imported from OTP file:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenImportedFromErsteFile(draftTransactions: Documents.DraftTransaction[], fileId: Api.File.Id, ...ersteRows: Import.Erste[]) {
    const errors = draftTransactions.flatMap((document, index) => {
      const row = ersteRows.find(r => document.description.includes(r.Kategória));
      
      const expectedIssuedAt = row?.Dátum;
      expectedIssuedAt.setMilliseconds(0);

      const comparer = new Comparer(document, {
        amount: row?.Összeg,
        issuedAt: row?.Dátum.toISOString(),
        transactionType: TransactionType.Draft,
        description: `${row['Partner név']} ${row.Közlemény} ${row.Kategória}`,
        file: fileId,
      }, '_id', 'expiresAt', 'createdAt', 'updatedAt', 'potentialDuplicates');

      return comparer.validate(`[${index}].`);
    });

    return {
      pass: errors.length === 0,
      message: () => `Expected draft transactions to have been imported from Erste file:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingDraftTransactionDocument(received: APIResponse, document: Documents.DraftTransaction, ...potentialDuplicates: Documents.Transaction[]) { 
    const response = await received.json() as Responses.DraftTransaction[];

    const matchingResponse = response.find(d => d.transactionId === getTransactionId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a transaction with id ${getTransactionId(document)}, but it was not found`,
      };
    }

    const comparer = new Comparer(matchingResponse, {
      transactionId: getTransactionId(document),
      amount: document.amount,
      issuedAt: document.issuedAt.toISOString(),
      description: document.description,
      transactionType: document.transactionType,
      potentialDuplicates: matchingResponse.potentialDuplicates.map((duplicateResponse, index) => {
        const duplicateDocument = potentialDuplicates[index];

        switch(duplicateResponse.transactionType) {
          case TransactionType.Payment:
            return validatePaymentTransactionResponse(duplicateResponse, duplicateDocument as Documents.PaymentTransaction);
          case TransactionType.Deferred:
            return validateDeferredTransactionResponse(duplicateResponse, duplicateDocument as Documents.DeferredTransaction);
          case TransactionType.Reimbursement:
            return validateReimbursementTransactionResponse(duplicateResponse, duplicateDocument as Documents.ReimbursementTransaction);
          case TransactionType.Split:
            return validateSplitTransactionResponse(duplicateResponse, duplicateDocument as Documents.SplitTransaction);
          case TransactionType.Transfer:
            return validateTransferTransactionResponse(duplicateResponse, duplicateDocument as Documents.TransferTransaction);
        }
      }),
    });

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to match draft transaction document, but it did not:\n${errors.join('\n')}`,
    };
  },
});
