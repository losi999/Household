import { fileProcessingStatuses, fileTypes } from '@household/shared/constants';
import { File } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const fileSchema = new Schema<File.Document>({
  fileType: {
    type: String,
    required: true,
    enum: fileTypes,
  },
  timezone: {
    type: String,
  },
  processingStatus: {
    type: String,
    default: 'pending',
    enum: fileProcessingStatuses,
  },
  expiresAt: {
    type: Schema.Types.Date,
    index: {
      expireAfterSeconds: 0,
    },
  },
  createdAt: {
    type: Schema.Types.Date,
    index: {
      expireAfterSeconds: 120,
      partialFilterExpression: {
        processingStatus: 'pending',
      },
    },
  },
}, {
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});
