import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const projectSchema = new Schema<Documents.Project>({
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
