import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { transactionServiceFactory } from '@household/shared/services/transaction-service';
import { accountServiceFactory } from '@household/shared/services/account-service';
import { reportDocumentConverterFactory } from '@household/shared/converters/report-document-converter';
import { writeFileSync } from 'fs';
import { addSeconds } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import { Types, mongo, startSession } from 'mongoose';
import path from 'path';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    // const reportDocumentConverter = reportDocumentConverterFactory();
    // const transactionService = transactionServiceFactory(mongodbService);
    // const accountService = accountServiceFactory(mongodbService);

    // const accounts = await accountService.listAccounts();
    // console.log(accounts.length);

    // const revolutAccountId = '665aca435689536dd37d847d';

    // const [
    //   first,
    //   second,
    // ] = reportDocumentConverter.createFilterQuery([
    //   {
    //     filterType: 'issuedAt',
    //     include: true,
    //     from: new Date(2024, 4, 1, 0, 0, 0).toISOString(),
    //     to: new Date(2024, 4, 31, 23, 59, 59).toISOString(),
    //   },
    //   {
    //     filterType: 'account',
    //     include: true,
    //     items: [revolutAccountId as any],
    //   },
    // ]);

    // const report = await transactionService.listTransactions(first, second);

    // writeFileSync(path.join('report', 'transactions.json'), JSON.stringify(report, null, 2), 'utf-8');
    // console.log(report.length);

    // const accounts = await accountService.listAccounts();

    // writeFileSync(path.join('report', 'accounts.json'), JSON.stringify(accounts, null, 2), 'utf-8');

    // const res1 = await mongodbService.accounts.aggregate([
    //   {
    //     $match: {
    //       _id: new Types.ObjectId(revolutAccountId),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'transactions',
    //       localField: '_id',
    //       foreignField: 'account',
    //       as: 'regular',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'transactions',
    //       localField: '_id',
    //       foreignField: 'transferAccount',
    //       as: 'inverted',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'transactions',
    //       localField: '_id',
    //       foreignField: 'payingAccount',
    //       as: 'paying',
    //     },
    //   },
    //   {
    //     $addFields: {
    //       balance: {
    //         $sum: [
    //           {
    //             $sum: '$regular.amount',
    //           },
    //           {
    //             $sum: '$inverted.transferAmount',
    //           },
    //           {
    //             $sum: '$paying.amount',
    //           },
    //         ],
    //       },
    //     },
    //   },

    //   {

    //     $project: {
    //       paying: false,
    //       regular: false,
    //       inverted: false,
    //     },
    //   },
    // ]);

    // console.log(JSON.stringify(res1, null, 0));

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
