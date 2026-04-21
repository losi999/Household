import { WORKDAY_LENGTH } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Dictionary, Searchable } from '@household/shared/types/common';
import { Account, Calendar, Category, Customer, File, Internal, Price, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { PopulateOptions, Types } from 'mongoose';

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

export const generateMongoId = (): Types.ObjectId => new Types.ObjectId();
export const getId = (doc: Internal.Id) => doc?._id?.toString() ?? doc?.toString();
export const getTransactionId = (doc: Transaction.Document | Transaction.RawReport | Types.ObjectId): Transaction.Id => getId(doc) as Transaction.Id;
export const getAccountId = (doc: Account.Document | Types.ObjectId): Account.Id => getId(doc) as Account.Id;
export const getProjectId = (doc: Project.Document | Types.ObjectId): Project.Id => getId(doc) as Project.Id;
export const getRecipientId = (doc: Recipient.Document | Types.ObjectId): Recipient.Id => getId(doc) as Recipient.Id;
export const getCustomerId = (doc: Customer.Document | Types.ObjectId): Customer.Id => getId(doc) as Customer.Id;
export const getProductId = (doc: Product.Document | Types.ObjectId): Product.Id => getId(doc) as Product.Id;
export const getCategoryId = (doc: Category.Document | Types.ObjectId): Category.Id => getId(doc) as Category.Id;
export const getFileId = (doc: File.Document | Types.ObjectId): File.Id => getId(doc) as File.Id;
export const getPriceId = (doc: Price.Document | Types.ObjectId): Price.Id => getId(doc) as Price.Id;
export const getCalendarEntryId = (doc: Calendar.Entry.Document | Types.ObjectId): Calendar.Entry.Id => getId(doc) as Calendar.Entry.Id;

export const calculateWorkdayLimits = (day: Calendar.Day.Response): Calendar.TimeInterval => {
  if (day.dayType === CalendarDayType.Holiday || day.dayType === CalendarDayType.Vacation || !day.start || !day.end) {
    return {
      start: undefined,
      end: undefined,
    };
  }

  const workEntries = day.entries.filter(e => e.entryType === CalendarEntryType.Work);
  if (workEntries.length === 0) {
    return {
      start: day.start,
      end: day.end,
    };
  }

  const { start: earliestStart, end: latestEnd } = workEntries.reduce<Calendar.TimeInterval>((accumulator, currentValue) => {
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

  const start = Math.max(calculatedStart, day.start);
  const end = Math.min(calculatedEnd, day.end);

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

export const createWorkEntryTitle = (customer: Customer.Response, job?: Customer.Job.Response) => {
  if (!job) {
    return `${customer.name}: `;
  }

  return customer.isGroup ? job.name : `${customer.name}: ${job.name}`;

};

export const toSearchTerms = (input: string): string[] => {
  const lowercased = input.toLowerCase();
  return [
    lowercased,
    lowercased.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  ];
};

export const filterSearchable = (items: Searchable[], searchValue: string) => {
  const terms = searchValue.trim().toLowerCase()
    .split(' ');

  return items?.filter(i => i.searchTerms?.some(s => terms.every(t => s.includes(t))));
};
