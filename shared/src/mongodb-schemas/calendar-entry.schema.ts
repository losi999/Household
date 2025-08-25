import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { Schema } from 'mongoose';

const priceSchema = new Schema<Calendar.Entry.Document['prices'][number]>({
  price: {
    type: Schema.Types.ObjectId,
    ref: 'prices',
  },
  quantity: {
    type: Number,
  },
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },
}, {
  versionKey: false,
  _id: false,
});

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
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customers',
  },
  prices: {
    type: [priceSchema],
    default: undefined,
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
