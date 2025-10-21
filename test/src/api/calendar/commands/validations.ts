import { Calendar, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getAccountId, getCalendarEntryId, getCategoryId, getCustomerId, getPriceId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { isListedPrice, isPriceBase } from '@household/shared/common/type-guards';
import { CalendarDayType, CalendarEntryType, PaymentType, SettingKey, TransactionType } from '@household/shared/enums';
import { default as moment } from 'moment-timezone';
import { WORKDAY_START, WORKDAY_END } from '@household/shared/constants';

const validateCalendarEntryResponseBase = ({ calendarEntryId, day, description, end, start, title }: Calendar.Entry.ResponseBase, document: Calendar.Entry.Document) => {
  expect(calendarEntryId, 'calendarEntryId').to.equal(getCalendarEntryId(document));
  expect(day, 'day').to.equal(document.day);
  expect(description, 'description').to.equal(document.description);
  expect(end, 'end').to.equal(document.end);
  expect(start, 'start').to.equal(document.start);
  expect(title, 'title').to.equal(document.title);
};

const validateCalendarEntryResponse = (response: Calendar.Entry.Response, document: Calendar.Entry.Document) => {
  if (response.entryType === CalendarEntryType.Work) {
    const { calendarEntryId, day, description, end, entryType, start, title, customer, isPaid, prices, ...empty } = response;
    validateCalendarEntryResponseBase({
      calendarEntryId,
      day,
      description,
      end,
      start,
      title,
    }, document);
    expect(entryType, 'entryType').to.equal(document.entryType);
    expect(isPaid, 'isPaid').to.equal(document.isPaid);
    cy.validateNestedObject('customer', customer).validateCustomerResponse(document.customer);
    
    for (let i = 0; i < prices.length; i += 1) {
      const priceResponse = prices[i];
      const priceDocument = document.prices[i];

      if (isListedPrice(priceResponse)) {
        if (!isPriceBase(priceDocument)) {
          const { quantity, ...price } = priceResponse;
          expect(quantity, `prices[${i}].quantity`).to.equal(priceDocument.quantity);
          cy.validateNestedObject(`prices[${i}]`, price).validatePriceResponse(priceDocument.price);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      } else {
        if (isPriceBase(priceDocument)) {
          expect(priceResponse.name, `job.prices[${i}].name`).to.equal(priceDocument.name);
          expect(priceResponse.amount, `job.prices[${i}].name`).to.equal(priceDocument.amount);
        } else {
          expect(true, 'job prices do not match').to.be.false;
        }
      }
    }
    expectEmptyObject(empty);
  } else {
    const { calendarEntryId, day, description, end, entryType, start, title, ...empty } = response;
    validateCalendarEntryResponseBase({
      calendarEntryId,
      day,
      description,
      end,
      start,
      title,
    }, document);
    expect(entryType, 'entryType').to.equal(document.entryType);
    expectEmptyObject(empty);
  }
};

const validateInCalendarEntryListResponse = (responses: Calendar.Entry.Response[], document: Calendar.Entry.Document) => {
  const response = responses.find(r => r.calendarEntryId === getCalendarEntryId(document));
  validateCalendarEntryResponseBase(response, document);
  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validateCalendarEntryDocument = (response: Calendar.Entry.CalendarEntryId, request: Calendar.Entry.Request) => {
  const id = response.calendarEntryId;
  cy.log('Get calendar entry document', id)
    .findCalendarEntryDocumentById(id)
    .should((document) => {
      const { customer, day, description, end, entryType, isPaid, prices, start, title, transaction, ...internal } = document;

      expect(entryType, 'entryType').to.equal(request.entryType);
      expect(day, 'day').to.equal(request.day);
      expect(start, 'start').to.equal(request.start);
      expect(end, 'end').to.equal(request.end);
      expect(title, 'title').to.equal(request.title);
      expect(description, 'description').to.equal(request.description);
      if (request.entryType === CalendarEntryType.Work) {
        expect(getCustomerId(customer), 'customer').to.equal(request.customerId);
        expect(isPaid, 'isPaid').to.be.false;
        expect(transaction, 'transaction').to.be.undefined;
        expect(prices?.length, 'prices.length').to.equal(request.prices?.length);
        for (let i = 0; i < prices?.length; i += 1) {
          const priceDocument = prices[i];
          const priceRequest = request.prices[i];

          if (isPriceBase(priceDocument)) {
            if (isPriceBase(priceRequest)) {
              expect(priceDocument.name, `prices[${i}].name`).to.equal(priceRequest.name);
              expect(priceDocument.amount, `prices[${i}].amount`).to.equal(priceRequest.amount);
            } else {
              expect(true, `prices[${i}] do not match`).to.be.false;
            }
          } else {
            if (!isPriceBase(priceRequest)) {
              expect(getPriceId(priceDocument.price), `prices[${i}].priceId`).to.equal(priceRequest.priceId);
              expect(priceDocument.quantity, `prices[${i}].quantity`).to.equal(priceRequest.quantity);
            } else {
              expect(true, `prices[${i}] do not match`).to.be.false;
            }
          }
        }
      } else {
        expect(customer, 'customer').to.be.undefined;
        expect(prices, 'prices').to.be.undefined;
        expect(isPaid, 'isPaid').to.be.undefined;
        expect(transaction, 'transaction').to.be.undefined;
      }

      expectRemainingProperties(internal);
    });
};

const validateCalendarEntryDocumentPaid = (originalDocument: Calendar.Entry.Document, request: Calendar.Entry.PaymentRequest) => {
  const calendarEntryId = getCalendarEntryId(originalDocument);
  cy.log('Get calendar entry document', calendarEntryId)
    .findCalendarEntryDocumentById(calendarEntryId)
    .then((document) => { 
      const { transaction, isPaid, customer, day, description, end, entryType, prices, start, title, ...internal } = document;
      
      expect(day, 'day').to.equal(originalDocument.day);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(end, 'end').to.equal(originalDocument.end);
      expect(entryType, 'entryType').to.equal(originalDocument.entryType);
      expect(title, 'title').to.equal(originalDocument.title);
      expect(start, 'start').to.equal(originalDocument.start);
      expect(getCustomerId(customer), 'customer').to.equal(getCustomerId(originalDocument.customer));
      expect(prices?.length, 'prices.length').to.equal(originalDocument.prices?.length);
      for(let i = 0; i < prices?.length; i += 1) {
        const actualPrice = prices[i];
        const originalPrice = originalDocument.prices[i];

        if (isPriceBase(actualPrice)) {
          if (isPriceBase(originalPrice)) {
            expect(actualPrice.name, `prices[${i}].name`).to.equal(originalPrice.name);
            expect(actualPrice.amount, `prices[${i}].amount`).to.equal(originalPrice.amount);
          } else {
            expect(true, `prices[${i}] do not match`).to.be.false;
          }
        } else {
          if (!isPriceBase(originalPrice)) {
            expect(getPriceId(actualPrice.price), `prices[${i}].priceId`).to.equal(getPriceId(originalPrice.price));
            expect(actualPrice.quantity, `prices[${i}].quantity`).to.equal(originalPrice.quantity);
          } else {
            expect(true, `prices[${i}] do not match`).to.be.false;
          }
        }
      }
      
      expect(isPaid, 'isPaid').to.be.true;
      if (request.paymentType === PaymentType.Transfer) {
        expect(transaction, 'transaction').to.be.undefined;
      } else {
        expect(transaction, 'transaction').to.not.be.undefined;
        const transactionId = getTransactionId(transaction);

        return cy.log('Get transaction document', transactionId)
          .getTransactionDocumentById(transactionId)
          .then((transactionDocument: Transaction.PaymentDocument) => {
            const { account, amount, billingEndDate, billingStartDate, category, description, invoiceNumber, issuedAt, product, project, quantity, recipient, transactionType } = transactionDocument;
            
            const expectedIssuedAt = moment.tz(document.day, 'Europe/Budapest'); 
            expectedIssuedAt.set({
              hour: Math.floor(document.end / 4),
              minute: (document.end % 4) * 15,
            });

            expect(amount, 'amount').to.equal(request.amount);
            expect(description, 'description').to.equal(document.title);
            expect(issuedAt.toISOString(), 'issuedAt').to.equal(expectedIssuedAt.utc().toISOString());
            expect(transactionType, 'transactionType').to.equal(TransactionType.Payment);

            cy.listSettingDocumentsByKeys([
              SettingKey.HairdressingIncomeAccount,
              SettingKey.HairdressingIncomeCategory,
            ])
              .then((settings) => {
                expect(getAccountId(account), 'account').to.equal(settings.find(s => s.settingKey === SettingKey.HairdressingIncomeAccount).value);
                expect(getCategoryId(category), 'category').to.equal(settings.find(s => s.settingKey === SettingKey.HairdressingIncomeCategory).value);
              });

            expect(billingEndDate, 'billingEndDate').to.be.undefined;
            expect(billingStartDate, 'billingStartDate').to.be.undefined;
            expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
            expect(product, 'product').to.be.undefined;
            expect(project, 'project').to.be.undefined;
            expect(quantity, 'quantity').to.be.undefined;
            expect(recipient, 'recipient').to.be.undefined;            
          });
          
      }

      expectRemainingProperties(internal);
    });    
};

const validateRelatedCalendarWorkEntryUnset = (calendarEntryId: Calendar.Entry.Id) => {
  cy.log('Get calendar entry document', calendarEntryId)
    .findCalendarEntryDocumentById(calendarEntryId)
    .should((document) => {

    });
};

const validateCalendarEntryDeleted = (calendarEntryId: Calendar.Entry.Id) => {
  cy.log('Get calendar entry document', calendarEntryId)
    .findCalendarEntryDocumentById(calendarEntryId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const validateCalendarDayDocument = (requestDay: Calendar.DayProp['day'], request: Calendar.Day.Request) => {
  cy.log('Get calendar day document', requestDay)
    .findCalendarDayDocumentByDay(requestDay)
    .should((document) => {
      const { day, dayType, end, start, ...internal } = document;
      expect(day, 'day').to.equal(requestDay);
      expect(dayType, 'dayType').to.equal(request.dayType);
      if (request.dayType === CalendarDayType.Workday) {
        expect(end, 'end').to.equal(request.end);
        expect(start, 'start').to.equal(request.start);
      } else {
        expect(end, 'end').to.be.undefined;
        expect(start, 'start').to.be.undefined;
      }
      expectRemainingProperties(internal);
    });
};

const validateInCalendarDayResponseList = (responses: Calendar.Day.Response[], dayInput: Calendar.DayProp['day'], calendarEntryDocument: Calendar.Entry.Document, calendarDayDocument?: Calendar.Day.Document) => {
  const response = responses.find(r => r.day === dayInput);
  switch(response.dayType) {
    case CalendarDayType.Workday: {
      const { day, dayType, end, start, entries, ...empty } = response;

      expect(day, 'day').to.equal(dayInput);
      expect(dayType, 'dayType').to.equal(CalendarDayType.Workday);
      expect(start, 'start').to.equal(calendarDayDocument?.start ?? WORKDAY_START);
      expect(end, 'end').to.equal(calendarDayDocument?.end ?? WORKDAY_END);
      
      cy.validateNestedObject('entries', entries).validateInCalendarEntryListResponse(calendarEntryDocument);

      expectEmptyObject(empty);
    } break;
    case CalendarDayType.Weekend: {
      const { day, dayType, end, start, entries, ...empty } = response;
      expect(day, 'day').to.equal(dayInput);
      expect(dayType, 'dayType').to.equal(CalendarDayType.Weekend);
      expect(start, 'start').to.equal(calendarDayDocument?.start ?? undefined);
      expect(end, 'end').to.equal(calendarDayDocument?.end ?? undefined);
      
      cy.validateNestedObject('entries', entries).validateInCalendarEntryListResponse(calendarEntryDocument);

      expectEmptyObject(empty);
    } break;
    case CalendarDayType.Holiday:{
      const { day, dayType, entries, ...empty } = response;
      expect(day, 'day').to.equal(dayInput);
      expect(dayType, 'dayType').to.equal(CalendarDayType.Holiday);
      
      cy.validateNestedObject('entries', entries).validateInCalendarEntryListResponse(calendarEntryDocument);

      expectEmptyObject(empty);
    } break;
    case CalendarDayType.Vacation: {
      const { day, dayType, entries, ...empty } = response;
      expect(day, 'day').to.equal(dayInput);
      expect(dayType, 'dayType').to.equal(CalendarDayType.Vacation);
      
      cy.validateNestedObject('entries', entries).validateInCalendarEntryListResponse(calendarEntryDocument);

      expectEmptyObject(empty);
    } break;
  }
  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validateCalendarDayDeleted = (day: Calendar.DayProp['day']) => {
  cy.log('Get calendar day document', day)
    .findCalendarDayDocumentByDay(day)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setCalendarValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateCalendarEntryDocument,
    validateCalendarEntryResponse,
    validateInCalendarEntryListResponse,
    validateInCalendarDayResponseList,
  });
  
  Cypress.Commands.addAll({
    validateCalendarDayDocument,
    validateCalendarDayDeleted,
    validateCalendarEntryDeleted,
    validateCalendarEntryDocumentPaid,
    validateRelatedCalendarWorkEntryUnset,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateCalendarDayDocument: CommandFunction<typeof validateCalendarDayDocument>;
      validateCalendarDayDeleted: CommandFunction<typeof validateCalendarDayDeleted>;
      validateCalendarEntryDeleted: CommandFunction<typeof validateCalendarEntryDeleted>;
      validateCalendarEntryDocumentPaid: CommandFunction<typeof validateCalendarEntryDocumentPaid>;
      validateRelatedCalendarWorkEntryUnset: CommandFunction<typeof validateRelatedCalendarWorkEntryUnset>;
    }

    interface ChainableResponseBody extends Chainable {
      validateCalendarEntryDocument: CommandFunctionWithPreviousSubject<typeof validateCalendarEntryDocument>;
      validateCalendarEntryResponse: CommandFunctionWithPreviousSubject<typeof validateCalendarEntryResponse>;
      validateInCalendarEntryListResponse: CommandFunctionWithPreviousSubject<typeof validateInCalendarEntryListResponse>;
      validateInCalendarDayResponseList: CommandFunctionWithPreviousSubject<typeof validateInCalendarDayResponseList>;
    }
  }
}
