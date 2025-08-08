import { Customer } from '@household/shared/types/types';
import { Schema } from 'mongoose';

const jobSchema = new Schema<Customer.Job>({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
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
  jobs: {
    type: [jobSchema],
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
