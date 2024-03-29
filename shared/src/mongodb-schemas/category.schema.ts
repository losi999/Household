import { categoryTypes } from '@household/shared/constants';
import { Category } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const categorySchema = new Schema<Category.Document>({
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  categoryType: {
    type: String,
    required: true,
    enum: categoryTypes,
  },
  fullName: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
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
