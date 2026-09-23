import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const recipientSchema = new Schema<Documents.Recipient>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
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
