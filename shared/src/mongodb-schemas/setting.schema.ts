import { Setting } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const settingSchema = new Schema<Setting.Document>({
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
