import { Import, Transaction } from '@household/shared/types/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect } from '@playwright/test';
import { TransactionType } from '@household/shared/enums';

export const test = baseTest.extend({});

export const expect = baseExpect.extend({
  toHaveBeenImportedFromRevolutFile(draftTransactions: Transaction.DraftDocument[], ...revolutRows: Import.Revolut[]) {
    const comparer = createComparer((compare) => {
      return {
        ...draftTransactions.reduce((accumulator, currentValue, index) => {
          const row = revolutRows.find(r => currentValue.description.includes(r.Type));

          return {
            ...accumulator,
            [`[${index}].amount`]: compare(currentValue.amount, row?.Amount - row?.Fee),
            [`[${index}].issuedAt`]: compare(currentValue.issuedAt.toISOString().split('.')[0], row?.['Started Date'].toISOString().split('.')[0]),
            [`[${index}].transactionType`]: compare(currentValue.transactionType, TransactionType.Draft),
            [`[${index}].description`]: compare(currentValue.description, `${row?.Type} ${row?.Description} ${row?.Currency}`),
            [`[${index}].potentialDuplicates`]: compare(currentValue.potentialDuplicates.length, 0),
          };
        }, {}),
      };
    });

    const message = comparer.validate();

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenImportedFromOtpFile(draftTransactions: Transaction.DraftDocument[], ...otpRows: Import.Otp[]) {
    const comparer = createComparer((compare) => {
      return {
        ...draftTransactions.reduce((accumulator, currentValue, index) => {
          const row = otpRows.find(r => currentValue.description.includes(r['Forgalom típusa']));

          return {
            ...accumulator,
            [`[${index}].amount`]: compare(currentValue.amount, row?.Összeg),
            [`[${index}].issuedAt`]: compare(currentValue.issuedAt.toISOString().split('.')[0], row?.['Tranzakció időpontja'].toISOString().split('.')[0]),
            [`[${index}].transactionType`]: compare(currentValue.transactionType, TransactionType.Draft),
            [`[${index}].description`]: compare(currentValue.description, `${row['Forgalom típusa']} ${row['Ellenoldali név']} ${row.Közlemény}`),
            [`[${index}].potentialDuplicates`]: compare(currentValue.potentialDuplicates.length, 0),
          };
        }, {}),
      };
    });

    const message = comparer.validate();

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenImportedFromErsteFile(draftTransactions: Transaction.DraftDocument[], ...ersteRows: Import.Erste[]) {
    const comparer = createComparer((compare) => {
      return {
        ...draftTransactions.reduce((accumulator, currentValue, index) => {
          const row = ersteRows.find(r => currentValue.description.includes(r.Kategória));

          return {
            ...accumulator,
            [`[${index}].amount`]: compare(currentValue.amount, row?.Összeg),
            [`[${index}].issuedAt`]: compare(currentValue.issuedAt.toISOString().split('.')[0], row?.Dátum.toISOString().split('.')[0]),
            [`[${index}].transactionType`]: compare(currentValue.transactionType, TransactionType.Draft),
            [`[${index}].description`]: compare(currentValue.description, `${row['Partner név']} ${row.Közlemény} ${row.Kategória}`),
            [`[${index}].potentialDuplicates`]: compare(currentValue.potentialDuplicates.length, 0),
          };
        }, {}),
      };
    });

    const message = comparer.validate();

    return {
      pass: !message,
      message: () => message,
    };
  },
});
