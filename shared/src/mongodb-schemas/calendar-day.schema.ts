import { CalendarDayType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const calendarDaySchema = new Schema<Calendar.Day.Document>({
  day: {
    type: String,
    required: true,
    index: true,
  },
  dayType: {
    type: String,
    required: true,
    enum: Object.values(CalendarDayType),
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
