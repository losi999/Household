import data from '@household/moneywallet-importer/data/Transaction.json'
import splitsData from '@household/moneywallet-importer/data/Split.json'
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';


export const transactionImporter = (mongodbService: IMongodbService) => {
  const getByLegacyId = (from: { [legacyId: string]: Types.ObjectId }, legacyId: string): Types.ObjectId => {
    if (!legacyId) {
      return undefined;
    }

    const id = from[legacyId.toLowerCase()];
    if (!id) {
      throw Error(`Unresolved legacy id, ${legacyId}`);
    }

    return id;
  }

  return async (legacyIds: {
    accounts: { [legacyId: string]: Types.ObjectId },
    categories: { [legacyId: string]: Types.ObjectId },
    projects: { [legacyId: string]: Types.ObjectId },
    recipients: { [legacyId: string]: Types.ObjectId }
  }) => {
    const total = data.length;
    const splits = data.filter(x => splitsData.some(sp => sp.ParentTransactionTransactionID === x.TransactionID));
    const payments = data.filter(x => !splitsData.some(sp => sp.ParentTransactionTransactionID === x.TransactionID) && !x.OtherTransactionTransactionID);
    const transfers = data.filter(x => x.OtherTransactionTransactionID);

    console.log('TOTAL', total);
    console.log('SPLITS', splits.length);
    console.log('PAYMENTS', payments.length);
    console.log('TRANSFERS', transfers.length);
    console.log('CHECK', total === splits.length + payments.length + transfers.length);

    const { accounts, categories, projects, recipients } = legacyIds;

    const paymentDocs = payments.map((p) => {
      const doc: Transaction.PaymentDocument = {
        transactionType: 'payment',
        amount: p.Amount,
        expiresAt: undefined,
        description: p.Memo,
        issuedAt: new Date(p.Date),
        account: getByLegacyId(accounts, p.AccountAccountID) as any,
        recipient: getByLegacyId(recipients, p.ReceiverReceiverID) as any,
        category: getByLegacyId(categories, p.CategoryCategoryID) as any,
        project: getByLegacyId(projects, p.ProjectProjectID) as any,
        accountId: undefined,
        projectId: undefined,
        recipientId: undefined,
        categoryId: undefined,
      };

      return doc;
    });

    await mongodbService.transactions.insertMany(paymentDocs);

    const splitDocs = splits.map((p) => {
      const doc: Transaction.SplitDocument = {
        transactionType: 'split',
        amount: p.Amount,
        expiresAt: undefined,
        description: p.Memo,
        issuedAt: new Date(p.Date),
        account: getByLegacyId(accounts, p.AccountAccountID) as any,
        recipient: getByLegacyId(recipients, p.ReceiverReceiverID) as any,
        splits: splitsData.filter(s => s.ParentTransactionTransactionID === p.TransactionID).map(s => {
          return {
            amount: s.Amount,
            description: s.Memo,
            category: getByLegacyId(categories, s.CategoryCategoryID) as any,
            project: getByLegacyId(projects, s.ProjectProjectID) as any,
          }
        }),
        accountId: undefined,
        recipientId: undefined,
      };

      return doc;
    });

    await mongodbService.transactions.insertMany(splitDocs);

    const transferPairs = transfers.reduce<{ [transactionId: string]: (typeof transfers[number])[] }>((accumulator, currentValue) => {
      if (Object.keys(accumulator).includes(currentValue.OtherTransactionTransactionID)) {
        return {
          ...accumulator,
          [currentValue.OtherTransactionTransactionID]: [
            ...accumulator[currentValue.OtherTransactionTransactionID],
            currentValue,
          ]
        };
      }

      return {
        ...accumulator,
        [currentValue.TransactionID]: [currentValue]
      };
    }, {});

    const transferDocs = Object.values(transferPairs).map((t) => {
      const doc: Transaction.TransferDocument = {
        transactionType: 'transfer',
        amount: t[0].Amount,
        expiresAt: undefined,
        description: t[0].Memo,
        issuedAt: new Date(t[0].Date),
        account: getByLegacyId(accounts, t[0].AccountAccountID) as any,
        transferAccount: getByLegacyId(accounts, t[1].AccountAccountID) as any,
        accountId: undefined,
        transferAccountId: undefined,
      };

      return doc;
    });

    await mongodbService.transactions.insertMany(transferDocs);
  };
};
