import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const settingSchema = new Schema<Documents.Setting>({
  settingKey: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
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
  },
});
