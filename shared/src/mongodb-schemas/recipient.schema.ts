import { Recipient } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const recipientSchema = new Schema<Recipient.Document>({
  name: {
    type: String,
    required: true,
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
  }
});