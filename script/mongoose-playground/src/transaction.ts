import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { addSeconds } from '@household/shared/common/utils';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import { Types, startSession } from 'mongoose';

(async () => {
  try {
    config();
    const mongodbService = mongodbServiceFactory(process.env.MONGODB_CONNECTION_STRING);

    const splits = await mongodbService.transactions.find<Transaction.SplitDocument>({
      transactionType: 'split',
      splits: {
        $elemMatch: {
          _id: {
            $exists: false,
          },
        },
      },
    });

    console.log(splits.length);

    await mongodbService.transactions.bulkWrite(splits.map(doc => {
      doc.splits.forEach(s => {
        if (!s._id) {
          s._id = new Types.ObjectId();
        }
      });

      return {
        updateOne: {
          filter: {
            _id: doc._id,
          },
          update: {
            splits: doc.splits,
          },
        },
      };
    }));

    // const accountIds = (await mongodbService.accounts.find({
    //   accountType: 'loan',
    // }).exec()).map(a => a._id);

    // await mongodbService.transactions.updateMany({
    //   transactionType: 'transfer',
    //   account: {
    //     $in: accountIds,
    //   },
    // }, [
    //   {
    //     $set: {
    //       amount: '$transferAmount',
    //       transactionType: 'loanTransfer',
    //     },
    //   },
    //   {
    //     $unset: 'transferAmount',
    //   },
    // ]);

    // await mongodbService.transactions.updateMany({
    //   transactionType: 'transfer',
    //   transferAccount: {
    //     $in: accountIds,
    //   },
    // }, [
    //   {
    //     $set: {
    //       transactionType: 'loanTransfer',
    //     },
    //   },
    //   {
    //     $unset: 'transferAmount',
    //   },
    // ]);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
