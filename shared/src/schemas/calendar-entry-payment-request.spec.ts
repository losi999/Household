import { default as schema } from '@household/shared/schemas/calendar-entry-payment-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createCalendarEntryPaymentRequest } from '@household/shared/common/test-data-factory';

describe('Calendar entry payment request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.PaymentRequest>(schema);
  tester.validateSuccess(createCalendarEntryPaymentRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCalendarEntryPaymentRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.paymentType', () => {
      tester.required(createCalendarEntryPaymentRequest({
        paymentType: undefined,
      }), 'paymentType');

      tester.type(createCalendarEntryPaymentRequest({
        paymentType: 1 as any,
      }), 'paymentType', 'string');

      tester.enum(createCalendarEntryPaymentRequest({
        paymentType: 'not-enum' as any,
      }), 'paymentType');
    });

    describe('if data.amount', () => {
      tester.required(createCalendarEntryPaymentRequest({
        amount: undefined,
      }), 'amount');

      tester.type(createCalendarEntryPaymentRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });
  });
});
