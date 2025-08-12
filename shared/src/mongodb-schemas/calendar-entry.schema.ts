import { CalendarEntry } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const calendarEntrySchema = new Schema<CalendarEntry.Document>({
  day: {
    type: Schema.Types.Date,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 1,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'work',
      'personal',
      'issue',
    ],
  },
  start: {
    type: Number,
  },
  end: {
    type: Number,
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

calendarEntrySchema.index({
  day: 1,
  start: 1,
});
