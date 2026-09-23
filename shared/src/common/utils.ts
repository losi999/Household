import { WORKDAY_END, WORKDAY_LENGTH, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Dictionary } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { PopulateOptions, Types } from 'mongoose';
import { Responses } from '@household/shared/types/responses';

export const keys = <O extends object>(obj: O): (keyof O)[] => {
  return Object.keys(obj) as (keyof O)[];
};

export const entries = <O extends object>(obj: O): [keyof O, O[keyof O]][] => {
  return Object.entries(obj) as [keyof O, O[keyof O]][];
};

export const populate = (...populateOptions: (string | PopulateOptions)[]): PopulateOptions[] => {
  return populateOptions.map(p => {
    return typeof p === 'string' ? {
      path: p,
    } : p;
  });
};

export const addSeconds = (seconds: number, dateFrom?: Date): Date => {
  if (dateFrom) {
    return new Date(dateFrom.getTime() + seconds * 1000);
  }
  return new Date(Date.now() + seconds * 1000);
};
export const addMinutes = (minutes: number, dateFrom?: Date): Date => addSeconds(minutes * 60, dateFrom);
export const addHours = (hours: number, dateFrom?: Date): Date => addSeconds(hours * 60 * 60, dateFrom);
export const addDays = (days: number, dateFrom?: Date): Date => addSeconds(days * 60 * 60 * 24, dateFrom);

export const numberToGivenDigits = (number: number, length: number = 2) => number.toString().padStart(length, '0');
export const dateToISODateString = (date: Date) => `${date.getFullYear()}-${numberToGivenDigits(date.getMonth() + 1)}-${numberToGivenDigits(date.getDate())}`;
export const dateToISOTimeString = (date: Date) => `${date.getHours()}:${numberToGivenDigits(date.getMinutes())}`;

export const timeSlotToTimeString = (slot: number) => {
  return `${Math.floor(slot / 4)}:${numberToGivenDigits((slot % 4) * 15)}`;
};

export const dateToTimeSlot = (date: Date) => date.getHours() * 4 + Math.floor(date.getMinutes() / 15) + 1;
export const timeSlotToDate = (slot: number): Date => {
  const date = new Date();
  date.setHours(Math.floor(slot / 4));
  date.setMinutes((slot % 4) * 15);
  return date;
};

export const toDictionary = <P>(docs: P[], key: keyof P): Dictionary<P> => {
  return docs.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue[key].toString()]: currentValue,
    };
  }, {});
};

export const toUndefined = (value: any) => {
  if (value?.length === 0) {
    return undefined;
  }

  return value ? value : undefined;
};

export const createDate = (date: string): Date => {
  return date ? new Date(date) : undefined;
};

export const pushUnique = <T>(array: T[], item: T) => {
  if (item && !array.includes(item)) {
    array.push(item);
  }
};

export const parseStringToBoolean = (value: string): boolean => {
  return value === 'true' ? true : value === 'false' ? false : undefined;
};

export const getId = (doc: Documents.Id) => doc?._id?.toString() ?? doc?.toString();
export const getTransactionId = (doc: Documents.Transaction | Documents.RawTransaction | Types.ObjectId): Api.Transaction.Id => getId(doc) as Api.Transaction.Id;
export const getAccountId = (doc: Documents.Account | Types.ObjectId): Api.Account.Id => getId(doc) as Api.Account.Id;
export const getProjectId = (doc: Documents.Project | Types.ObjectId): Api.Project.Id => getId(doc) as Api.Project.Id;
export const getRecipientId = (doc: Documents.Recipient | Types.ObjectId): Api.Recipient.Id => getId(doc) as Api.Recipient.Id;
export const getCustomerId = (doc: Documents.Customer | Types.ObjectId): Api.Customer.Id => getId(doc) as Api.Customer.Id;
export const getProductId = (doc: Documents.Product | Types.ObjectId): Api.Product.Id => getId(doc) as Api.Product.Id;
export const getCategoryId = (doc: Documents.Category | Types.ObjectId): Api.Category.Id => getId(doc) as Api.Category.Id;
export const getFileId = (doc: Documents.File | Types.ObjectId): Api.File.Id => getId(doc) as Api.File.Id;
export const getPriceId = (doc: Documents.Price | Types.ObjectId): Api.Price.Id => getId(doc) as Api.Price.Id;
export const getCalendarEntryId = (doc: Documents.CalendarEntry | Types.ObjectId): Api.Calendar.Entry.Id => getId(doc) as Api.Calendar.Entry.Id;

export const isWeekend = (date: Date | string): boolean => {
  return [
    0,
    6,
  ].includes((typeof date === 'string' ? createDate(date) : date).getDay());
};

export const calculateWorkdayLimits = (day: Responses.CalendarDay): Api.Calendar.TimeInterval => {
  if (day.dayType === CalendarDayType.Holiday || day.dayType === CalendarDayType.Vacation || (isWeekend(day.day) && (!day.start || !day.end))) {
    return {
      start: undefined,
      end: undefined,
    };
  }

  const dayStart = day.start ?? WORKDAY_START;
  const dayEnd = day.end ?? WORKDAY_END;

  const workEntries = day.entries.filter(e => e.entryType === CalendarEntryType.Work);
  if (workEntries.length === 0) {
    return {
      start: dayStart,
      end: dayEnd,
    };
  }

  const { start: earliestStart, end: latestEnd } = workEntries.reduce<Api.Calendar.TimeInterval>((accumulator, currentValue) => {
    return {
      start: currentValue.start < accumulator.start ? currentValue.start : accumulator.start,
      end: currentValue.end > accumulator.end ? currentValue.end : accumulator.end,
    };
  }, {
    start: Number.POSITIVE_INFINITY,
    end: Number.NEGATIVE_INFINITY,
  });

  const calculatedStart = latestEnd - WORKDAY_LENGTH;
  const calculatedEnd = earliestStart + WORKDAY_LENGTH;

  const start = Math.max(calculatedStart, dayStart);
  const end = Math.min(calculatedEnd, dayEnd);

  if (start <= end) {
    return {
      start,
      end,
    };
  }

  return {
    start: undefined,
    end: undefined,
  };
};

export const toSearchTerms = (input: string): string[] => {
  const lowercased = input.toLowerCase().split(' ');

  return [
    ...new Set(lowercased.flatMap(term => {
      return [
        term,
        term.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      ];
    })),
  ];
};
