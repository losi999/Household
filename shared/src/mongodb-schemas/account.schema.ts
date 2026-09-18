import { AccountType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const accountSchema = new Schema<Documents.Account>({
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  currency: {
    type: String,
    required: true,
    minlength: 1,
  },
  isOpen: {
    type: Boolean,
    require: true,
    default: true,
  },
  accountType: {
    type: String,
    enum: AccountType,
  },
  owner: {
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

accountSchema.index({
  name: 1,
  owner: 1,
}, {
  unique: true,
});
