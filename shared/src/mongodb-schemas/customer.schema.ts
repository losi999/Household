import { Customer } from '@household/shared/types/types';
import { Schema } from 'mongoose';

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
    type: [
      {
        price: {
          type: Schema.Types.ObjectId,
          ref: 'prices',
        },
        quantity: {
          type: Number,
        },
      },
    ],
    required: true,
    _id: false,
  },
  additionalPrice: {
    type: Number,
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
  isArchived: {
    type: Boolean,
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
