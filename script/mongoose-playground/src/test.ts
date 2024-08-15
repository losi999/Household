import { populate } from '@household/shared/common/utils';
import { mongodbServiceFactory } from '@household/shared/services/mongodb-service';
import { Transaction } from '@household/shared/types/types';
import { config } from 'dotenv';
import { Types, createConnection } from 'mongoose';
import { Schema } from 'mongoose';

const itemSchema = new Schema({}, {
  _id: false,
  discriminatorKey: 'transactionType',
});

const schema = new Schema<Transaction.SplitDocument>({
  splits: [itemSchema],
  // {
  //   billingEndDate: {
  //     type: Date,
  //   },
  //   billingStartDate: {
  //     type: Date,
  //   },
  // },
  // {
  //   _id: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'transactions',
  //   },
  //   accounts: {
  //     payingAccount: {
  //       type: Schema.Types.ObjectId,
  //     },
  //   },
  // },
}, {
  versionKey: false,
});

const splitsArray = schema.path<Schema.Types.DocumentArray>('splits');

splitsArray.discriminator('deferred', new Schema({
  accounts: {
    payingAccount: {
      type: Schema.Types.ObjectId,
    },
  },
}));

splitsArray.discriminator('split', new Schema({
  billingEndDate: {
    type: Date,
  },
  billingStartDate: {
    type: Date,
  },
}, {
  _id: false,
}));

(async () => {
  try {
    config();
    const connection = createConnection(process.env.MONGODB_CONNECTION_STRING);

    const model = connection.model('split', schema);

    const doc: Partial<Transaction.SplitDocument> = {
      description: 'asfg',
      splits: [
        {
          transactionType: 'split',
          billingEndDate: new Date(),
          billingStartDate: new Date(),
          _id: undefined,
          accountId: undefined,
          accounts: undefined,
          amount: undefined,
          category: undefined,
          categoryId: undefined,
          description: undefined,
          expiresAt: undefined,
          invoiceNumber: undefined,
          issuedAt: undefined,
          loanAccountId: undefined,
          product: undefined,
          productId: undefined,
          project: undefined,
          projectId: undefined,
          quantity: undefined,
          recipient: undefined,
          recipientId: undefined,
          createdAt: undefined,
          remainingAmount: undefined,
          updatedAt: undefined,
        },
        {
          transactionType: 'deferred',
          _id: new Types.ObjectId(),
          accounts: {
            payingAccount: {
              _id: new Types.ObjectId(),
            },
          },
        } as any,
      ],
    };

    await model.create(doc);

  } catch (error) {
    console.log('ERR', error);
  } finally {
    console.log('Finally');
    process.exit();
  }
})();
