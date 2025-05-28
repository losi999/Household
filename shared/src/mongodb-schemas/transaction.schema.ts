import { TransactionType } from '@household/shared/enums';
import { Transaction } from '@household/shared/types/types';
import { Schema, SchemaDefinition, SchemaDefinitionType } from 'mongoose';

const splitItemSchema = new Schema<Transaction.SplitDocumentItem>({
  amount: {
    type: Number,
    required: true,
  },
  invoiceNumber: {
    type: String,
    minlength: 1,
  },
  billingEndDate: {
    type: Date,
  },
  billingStartDate: {
    type: Date,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    index: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'projects',
    index: true,
  },
  quantity: {
    type: Number,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    index: true,
  },
  description: {
    type: String,
    minlength: 1,
  },
}, {
  _id: false,
});

const deferredSplitSchema = new Schema<Transaction.DeferredDocument>({
  transactionType: {
    type: String,
    enum: ['deferred'],
  },
  isSettled: {
    type: Boolean,
    default: false,
  },
  payingAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
    index: true,
  },
  ownerAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
    index: true,
  },
  description: {
    type: String,
    minlength: 1,
  },
  amount: {
    type: Number,
    required: true,
    max: 0,
  },
  quantity: {
    type: Number,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    index: true,
  },
  invoiceNumber: {
    type: String,
    minlength: 1,
  },
  billingEndDate: {
    type: Date,
  },
  billingStartDate: {
    type: Date,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    index: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'projects',
    index: true,
  },
});

const schemaDefinition: SchemaDefinition<SchemaDefinitionType<Transaction.Document>, Transaction.Document> = {
  transactionType: {
    type: String,
    enum: TransactionType,
  },
  issuedAt: {
    type: Schema.Types.Date,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
    index: true,
  },
  transferAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
    index: true,
  },
  payingAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
    index: true,
  },
  ownerAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
    index: true,
  },
  isSettled: {
    type: Boolean,
    default: function() {
      return this.transactionType === 'deferred' ? false : undefined;
    },
  },
  description: {
    type: String,
    minlength: 1,
  },
  quantity: {
    type: Number,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    index: true,
  },
  invoiceNumber: {
    type: String,
    minlength: 1,
  },
  billingEndDate: {
    type: Date,
  },
  billingStartDate: {
    type: Date,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    index: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'projects',
    index: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'recipients',
    index: true,
  },
  payments: {
    type: [
      {
        transaction: {
          type: Schema.Types.ObjectId,
          ref: 'transactions',
          required: true,
          index: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    default: undefined,
    _id: false,
  },
  transferAmount: {
    type: Number,
  },
  splits: {
    type: [splitItemSchema],
    default: undefined,
  },
  deferredSplits: {
    type: [deferredSplitSchema],
    default: undefined,
  },
  expiresAt: {
    type: Schema.Types.Date,
  },
  file: {
    type: Schema.Types.ObjectId,
    ref: 'files',
    index: true,
  },
};

export const transactionSchema = new Schema<Transaction.Document>(schemaDefinition, {
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});

transactionSchema.index({
  expiresAt: 1,
}, {
  expireAfterSeconds: 0,
});
