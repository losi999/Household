import { TransactionType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { Schema, SchemaDefinition, SchemaDefinitionType } from 'mongoose';

const splitItemSchema = new Schema<Documents.SplitItem>({
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

const deferredSplitSchema = new Schema<Documents.DeferredTransaction>({
  transactionType: {
    type: String,
    enum: ['deferred'],
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

const schemaDefinition: SchemaDefinition<SchemaDefinitionType<Documents.Transaction>, Documents.Transaction> = {
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

export const transactionSchema = new Schema<Documents.Transaction>(schemaDefinition, {
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
