import { Category } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const categorySchema = new Schema<Category.Document>({
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
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