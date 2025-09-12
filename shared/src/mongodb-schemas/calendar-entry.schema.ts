import { CalendarEntryType } from '@household/shared/enums';
import { jobPriceSchema } from '@household/shared/mongodb-schemas/customer.schema';
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
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customers',
  },
  prices: {
    type: [jobPriceSchema],
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
