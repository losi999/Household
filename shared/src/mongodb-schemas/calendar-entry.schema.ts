import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const calendarEntrySchema = new Schema<Calendar.Entry.Document>({
  day: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 1,
  },
  description: {
    type: String,
    minlength: 1,
  },
  entryType: {
    type: String,
    required: true,
    enum: Object.values(CalendarEntryType),
  },
  start: {
    type: Number,
  },
  end: {
    type: Number,
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: 'transactions',
  },
  resolution: {
    status: {
      type: String,
      enum: Object.values(CalendarEntryResolutionStatus),
    },
    delay: {
      type: Number,
    },
    _id: false,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customers',
  },
  prices: {
    type: [
      {
        price: {
          type: Schema.Types.ObjectId,
          ref: 'prices',
        },
        quantity: {
          type: Number,
        },
      },
    ],
    default: undefined,
    _id: false,
  },
  additionalPrice: {
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
