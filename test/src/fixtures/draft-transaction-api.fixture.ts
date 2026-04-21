import { Import, Transaction, File } from '@household/shared/types/types';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect } from '@playwright/test';
import { TransactionType } from '@household/shared/enums';
import { Comparer } from '@household/test/comparer';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toHaveBeenImportedFromRevolutFile(draftTransactions: Transaction.DraftDocument[], fileId: File.Id, ...revolutRows: Import.Revolut[]) {

    const errors = draftTransactions.flatMap((document, index) => {
      const row = revolutRows.find(r => document.description.includes(r.Type));
      
      const comparer = new Comparer(document, {
        amount: row?.Amount - row?.Fee,
        issuedAt: row?.['Started Date'].toISOString(),
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
  toHaveBeenImportedFromOtpFile(draftTransactions: Transaction.DraftDocument[], fileId: File.Id, ...otpRows: Import.Otp[]) {
    const errors = draftTransactions.flatMap((document, index) => {
      const row = otpRows.find(r => document.description.includes(r['Forgalom típusa']));
      
      const comparer = new Comparer(document, {
        amount: row?.Összeg,
        issuedAt: row?.['Tranzakció időpontja'].toISOString(),
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
  toHaveBeenImportedFromErsteFile(draftTransactions: Transaction.DraftDocument[], fileId: File.Id, ...ersteRows: Import.Erste[]) {
    const errors = draftTransactions.flatMap((document, index) => {
      const row = ersteRows.find(r => document.description.includes(r.Kategória));
      
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
});
