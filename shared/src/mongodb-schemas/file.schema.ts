import { FileProcessingStatus, FileType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const fileSchema = new Schema<Documents.File>({
  fileType: {
    type: String,
    required: true,
    enum: FileType,
  },
  timezone: {
    type: String,
  },
  processingStatus: {
    type: String,
    default: FileProcessingStatus.Pending,
    enum: FileProcessingStatus,
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
        processingStatus: FileProcessingStatus.Pending,
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
