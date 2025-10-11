import { default as schema } from '@household/shared/schemas/calendar-entry-payment-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { calendarEntryDataFactory } from '@household/shared/common/test-data-factory';

describe('Calendar entry payment request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.PaymentRequest>(schema);
  tester.validateSuccess(calendarEntryDataFactory.paymentRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarEntryDataFactory.paymentRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.paymentType', () => {
      tester.required(calendarEntryDataFactory.paymentRequest({
        paymentType: undefined,
      }), 'paymentType');

      tester.type(calendarEntryDataFactory.paymentRequest({
        paymentType: 1 as any,
      }), 'paymentType', 'string');

      tester.enum(calendarEntryDataFactory.paymentRequest({
        paymentType: 'not-enum' as any,
      }), 'paymentType');
    });

    describe('if data.amount', () => {
      tester.required(calendarEntryDataFactory.paymentRequest({
        amount: undefined,
      }), 'amount');

      tester.type(calendarEntryDataFactory.paymentRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });
  });
});
