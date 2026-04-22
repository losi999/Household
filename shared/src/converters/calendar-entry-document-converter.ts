import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getCalendarEntryId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar, Customer, Price, Transaction } from '@household/shared/types/types';
import { AnyKeys, AnyObject } from 'mongoose';

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
  resolve(data: {
    body: Calendar.Entry.ResolutionRequest;
    transaction?: Transaction.PaymentDocument;
  }, expiresIn: number): DocumentUpdate<Calendar.Entry.Document>;
  toResponseBase(doc: Calendar.Entry.Document): Calendar.Entry.ResponseBase;
  toWorkEntryResponseBase(doc: Calendar.Entry.Document): Calendar.Entry.WorkEntryResponseBase;
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
        resolution: undefined,
        customer: body.entryType === CalendarEntryType.Work ? customer : undefined,
        prices: body.entryType === CalendarEntryType.Work ? customerDocumentConverter.createJobPriceList(body.prices, prices) : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body, customer, prices }, expiresIn) => {
      let $set: AnyKeys<Calendar.Entry.Document> & AnyObject;
      let $unset: AnyKeys<Calendar.Entry.Document> & AnyObject;
      
      if (body.entryType === CalendarEntryType.Work) {
        const { customerId, ...rest } = body;
        $set = {
          ...rest,
          customer,
        };

        if (body.prices) {
          $set.prices = customerDocumentConverter.createJobPriceList(body.prices, prices);
        } else {
          $unset = {
            prices: true,
          };
        }
      } else {
        $set = {
          ...body,
        };
      }

      if (!body.description) {
        $unset = {
          ...$unset,
          description: true,
        };
      }
      return {
        update: {
          $set: {
            ...$set,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
          ...($unset ? {
            $unset,
          } : {}),
        },
      };
    },
    resolve: ({ body, transaction }, expiresIn) => {
      return {
        update: {
          $set: {
            resolution: {
              status: body.status,
              ...(body.status !== CalendarEntryResolutionStatus.NoShow ? {
                delay: body.delay,
              } : {}),
            },
            transaction,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
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
    toWorkEntryResponseBase: (doc) => {
      return {
        ...instance.toResponseBase(doc),
        resolution: doc.resolution ? {
          delay: doc.resolution.delay,
          status: doc.resolution.status,
        } : undefined,
      };
    },
    toResponse: (doc) => {
      if (doc.entryType === CalendarEntryType.Work) {
        return {
          ...instance.toWorkEntryResponseBase(doc),
          entryType: doc.entryType,
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
