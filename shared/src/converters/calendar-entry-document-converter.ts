import { generateMongoId, getCalendarEntryId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { CalendarEntryType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar, Customer, Price } from '@household/shared/types/types';

export interface ICalendarEntryDocumentConverter {
  create(data: { 
    body: Calendar.Entry.Request;
    customer?: Customer.Document;
    prices?: Price.Document[];
  }, expiresIn: number, generateId?: boolean): Calendar.Entry.Document;
  update(data: { 
    body: Calendar.Entry.Request;
    customer?: Customer.Document;
    prices?: Price.Document[];
  }, expiresIn: number): DocumentUpdate<Calendar.Entry.Document>;
  updatePaid(): DocumentUpdate<Calendar.Entry.Document>;
  toResponseBase(doc: Calendar.Entry.Document): Calendar.Entry.ResponseBase;
  toResponse(doc: Calendar.Entry.Document): Calendar.Entry.Response;
  toResponseList(docs: Calendar.Entry.Document[]): Calendar.Entry.Response[];
}

export const calendarEntryDocumentConverterFactory = (customerDocumentConverter: ICustomerDocumentConverter): ICalendarEntryDocumentConverter => {
  const instance: ICalendarEntryDocumentConverter = {
    create: ({ body, customer, prices }, expiresIn, generateId) => {
      const { end, start, title, description, day } = body;

      return {
        title,
        entryType: body.entryType,
        start,
        end,
        description,
        day,
        transaction: undefined,
        isPaid: body.entryType === CalendarEntryType.Work ? false : undefined,
        customer: body.entryType === CalendarEntryType.Work ? customer : undefined,
        prices: body.entryType === CalendarEntryType.Work ? customerDocumentConverter.createJobPriceList(body.prices, prices) : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body, customer, prices }, expiresIn) => {
      return {
        update: {
          $set: {
            ...body,
            customer: body.entryType === CalendarEntryType.Work ? customer : undefined,
            prices: body.entryType === CalendarEntryType.Work ? customerDocumentConverter.createJobPriceList(body.prices, prices) : undefined,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
          ...(!body.description ? {
            $unset: {
              description: true,
            },
          } : {}), // TODO unset prices
        },
      };
    },
    updatePaid: () => {
      return {
        update: {
          $set: {
            isPaid: true,
          },
        },
      };
    },
    toResponseBase: ({ _id, day, description, end, start, title }) => {
      return {
        calendarEntryId: getCalendarEntryId(_id),
        day,
        title,
        description,
        start,
        end,
      };
    },
    toResponse: (doc) => {
      if (doc.entryType === CalendarEntryType.Work) {
        return {
          ...instance.toResponseBase(doc),
          entryType: doc.entryType,
          isPaid: doc.isPaid,
          customer: customerDocumentConverter.toResponse(doc.customer),
          prices: customerDocumentConverter.toResponseJobPriceList(doc.prices),
        };
      }
      return {
        ...instance.toResponseBase(doc),
        entryType: doc.entryType,
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
