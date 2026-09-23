import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getCalendarEntryId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { AnyKeys, AnyObject } from 'mongoose';

export interface ICalendarEntryDocumentConverter {
  create(data: { 
    body: Requests.CalendarEntry;
    customer?: Documents.Customer;
    prices?: Documents.Price[];
  }, expiresIn: number, generateId?: boolean): Documents.CalendarEntry;
  update(data: { 
    body: Requests.CalendarEntry;
    customer?: Documents.Customer;
    prices?: Documents.Price[];
  }, expiresIn: number): DocumentUpdate<Documents.CalendarEntry>;
  resolve(data: {
    body: Requests.CalendarEntryResolution;
    transaction?: Documents.PaymentTransaction;
  }, expiresIn: number): DocumentUpdate<Documents.CalendarEntry>;
  toResponseBase(doc: Documents.CalendarEntry): Responses.CalendarEntryLean;
  toWorkEntryResponseBase(doc: Documents.CalendarEntry): Responses.CalendarEntryWorkLean;
  toResponse(doc: Documents.CalendarEntry): Responses.CalendarEntry;
  toResponseList(docs: Documents.CalendarEntry[]): Responses.CalendarEntry[];
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
        additionalPrice: body.entryType === CalendarEntryType.Work ? body.additionalPrice : undefined,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ body, customer, prices }, expiresIn) => {
      let $set: AnyKeys<Documents.CalendarEntry> & AnyObject;
      let $unset: AnyKeys<Documents.CalendarEntry> & AnyObject;
      
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

        if (body.additionalPrice === undefined) {
          $unset = {
            ...$unset,
            additionalPrice: true,
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
          additionalPrice: doc.additionalPrice,
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
