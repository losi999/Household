import { CategoryType } from '@household/shared/enums';
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
    enum: CategoryType,
  },
  ancestors: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'categories',
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

categorySchema.index({
  name: 1,
  ancestors: 1,
}, {
  unique: true,
});
