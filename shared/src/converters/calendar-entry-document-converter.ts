import { isPriceBase } from '@household/shared/common/type-guards';
import { generateMongoId, getCalendarEntryId, getPriceId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
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
  toResponse(doc: Calendar.Entry.Document): Calendar.Entry.Response;
  toResponseList(docs: Calendar.Entry.Document[]): Calendar.Entry.Response[];
}

export const calendarEntryDocumentConverterFactory = (customerDocumentConverter: ICustomerDocumentConverter, priceDocumentConverter: IPriceDocumentConverter): ICalendarEntryDocumentConverter => {
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
        customer: body.entryType === CalendarEntryType.Work ? customer : undefined,
        prices: body.entryType === CalendarEntryType.Work ? body.prices.map((p) => {
          if (isPriceBase(p)) {
            return {
              name: p.name,
              amount: p.amount,
            };
          }

          return {
            price: prices.find(x => getPriceId(x) === p.priceId),
            quantity: p.quantity,
          };
        }) : undefined,
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
            prices: body.entryType === CalendarEntryType.Work ? body.prices.map((p) => {
              if (isPriceBase(p)) {
                return {
                  name: p.name,
                  amount: p.amount,
                };
              }

              return {
                price: prices.find(x => getPriceId(x) === p.priceId),
                quantity: p.quantity,
              };
            }) : undefined,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
          ...(!body.description ? {
            $unset: {
              description: true,
            },
          } : {}),
        },
      };
    },
    toResponse: (doc) => {
      const { _id, end, start, title, description } = doc;

      if (doc.entryType === CalendarEntryType.Work) {
        return {
          calendarEntryId: getCalendarEntryId(_id),
          end,
          start,
          title,
          entryType: doc.entryType,
          description,
          customer: customerDocumentConverter.toResponse(doc.customer),
          prices: doc.prices.map((p) => {
            if (isPriceBase(p)) {
              return {
                amount: p.amount,
                name: p.name,
                priceId: undefined,
                quantity: undefined,
                unitOfMeasurement: undefined,
              };
            }

            return {
              quantity: p.quantity,
              ...priceDocumentConverter.toResponse(p.price),
            };
          }),   
        };
      }
      return {
        calendarEntryId: getCalendarEntryId(_id),
        end,
        start,
        title,
        entryType: doc.entryType,
        description,
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
