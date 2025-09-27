import { Customer } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const jobPriceSchema = new Schema<Customer.Job.Document['prices'][number]>({
  price: {
    type: Schema.Types.ObjectId,
    ref: 'prices',
  },
  quantity: {
    type: Number,
  },
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },
}, {
  versionKey: false,
  _id: false,
});

const jobSchema = new Schema<Customer.Job.Document>({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  prices: {
    type: [jobPriceSchema],
    required: true,
  },
  description: {
    type: String,
  },
}, {
  versionKey: false,
  _id: false,
});

export const customerSchema = new Schema<Customer.Document>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  description: {
    type: String,
    minlength: 1,
  },
  isGroup: {
    type: Boolean,
  },
  rating: {
    type: Number,
  },
  jobs: {
    type: [jobSchema],
    default: [],
  },
  blacklistedCustomers: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'customers',
      },
    ],
    default: [],
  },
  expiresAt: {
    type: Schema.Types.Date,
    index: {
      expireAfterSeconds: 0,
    },
  },
}, {
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});
