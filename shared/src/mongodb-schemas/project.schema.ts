import { Project } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const projectSchema = new Schema<Project.Document>({
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
