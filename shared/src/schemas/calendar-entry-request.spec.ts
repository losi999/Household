import { default as schema } from '@household/shared/schemas/calendar-entry-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createCalendarIssueEntryRequest, createCalendarPersonalEntryRequest, createCalendarWorkEntryRequest, customerDataFactory, createListedPriceRequest, priceDataFactory } from '@household/shared/common/test-data-factory';
import { CalendarEntryType } from '@household/shared/enums';

describe('Calendar personal entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.PersonalEntryRequest>(schema);
  tester.validateSuccess(createCalendarPersonalEntryRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCalendarPersonalEntryRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(createCalendarPersonalEntryRequest({
        day: undefined,
      }), 'day');

      tester.type(createCalendarPersonalEntryRequest({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(createCalendarPersonalEntryRequest({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(createCalendarPersonalEntryRequest({
        title: undefined,
      }), 'title');

      tester.type(createCalendarPersonalEntryRequest({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(createCalendarPersonalEntryRequest({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(createCalendarPersonalEntryRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createCalendarPersonalEntryRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(createCalendarPersonalEntryRequest({
        entryType: 1 as any,
      }), 'entryType', 'string');

      tester.const(createCalendarPersonalEntryRequest({
        entryType: CalendarEntryType.Work as any,
      }), 'entryType');
    });

    describe('if data.start', () => {
      tester.required(createCalendarPersonalEntryRequest({
        start: undefined,
      }), 'start');

      tester.type(createCalendarPersonalEntryRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(createCalendarPersonalEntryRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(createCalendarPersonalEntryRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(createCalendarPersonalEntryRequest({
        end: undefined,
      }), 'end');

      tester.type(createCalendarPersonalEntryRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(createCalendarPersonalEntryRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(createCalendarPersonalEntryRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(createCalendarPersonalEntryRequest({
        start: 20,
        end: 10,
      }), 'end', 20);
    });
  });
});

describe('Calendar issue entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.IssueEntryRequest>(schema);
  tester.validateSuccess(createCalendarIssueEntryRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCalendarIssueEntryRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(createCalendarIssueEntryRequest({
        day: undefined,
      }), 'day');

      tester.type(createCalendarIssueEntryRequest({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(createCalendarIssueEntryRequest({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(createCalendarIssueEntryRequest({
        title: undefined,
      }), 'title');

      tester.type(createCalendarIssueEntryRequest({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(createCalendarIssueEntryRequest({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(createCalendarIssueEntryRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createCalendarIssueEntryRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(createCalendarIssueEntryRequest({
        entryType: 1 as any,
      }), 'entryType', 'string');

      tester.const(createCalendarIssueEntryRequest({
        entryType: CalendarEntryType.Work as any,
      }), 'entryType');
    });

    describe('if data.start', () => {
      tester.required(createCalendarIssueEntryRequest({
        start: undefined,
      }), 'start');

      tester.type(createCalendarIssueEntryRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(createCalendarIssueEntryRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(createCalendarIssueEntryRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(createCalendarIssueEntryRequest({
        end: undefined,
      }), 'end');

      tester.type(createCalendarIssueEntryRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(createCalendarIssueEntryRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(createCalendarIssueEntryRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(createCalendarIssueEntryRequest({
        start: 20,
        end: 10,
      }), 'end', 20);
    });
  });
});

describe('Calendar work entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.WorkEntryRequest>(schema);
  tester.validateSuccess(createCalendarWorkEntryRequest());
  tester.validateSuccess(createCalendarWorkEntryRequest({
    prices: undefined,
  }), 'without prices');

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCalendarWorkEntryRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(createCalendarWorkEntryRequest({
        day: undefined,
      }), 'day');

      tester.type(createCalendarWorkEntryRequest({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(createCalendarWorkEntryRequest({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(createCalendarWorkEntryRequest({
        title: undefined,
      }), 'title');

      tester.type(createCalendarWorkEntryRequest({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(createCalendarWorkEntryRequest({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(createCalendarWorkEntryRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createCalendarWorkEntryRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(createCalendarWorkEntryRequest({
        entryType: 1 as any,
      }), 'entryType', 'string');
    });

    describe('if data.start', () => {
      tester.required(createCalendarWorkEntryRequest({
        start: undefined,
      }), 'start');

      tester.type(createCalendarWorkEntryRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(createCalendarWorkEntryRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(createCalendarWorkEntryRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(createCalendarWorkEntryRequest({
        end: undefined,
      }), 'end');

      tester.type(createCalendarWorkEntryRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(createCalendarWorkEntryRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(createCalendarWorkEntryRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(createCalendarWorkEntryRequest({
        start: 20,
        end: 10,
      }), 'end', 20);
    });

    describe('if data.customerId', () => {
      tester.required(createCalendarWorkEntryRequest({
        customerId: undefined,
      }), 'customerId');

      tester.type(createCalendarWorkEntryRequest({
        customerId: 1 as any,
      }), 'customerId', 'string');

      tester.pattern(createCalendarWorkEntryRequest({
        customerId: customerDataFactory.id('not-a-mongo-id'),
      }), 'customerId');
    });

    describe('if data.prices', () => {
      tester.type(createCalendarWorkEntryRequest({
        prices: {} as any,
      }), 'prices', 'array');
      
      tester.minItems(createCalendarWorkEntryRequest({
        prices: [],
      }), 'prices', 1);
    });

    describe('if data.prices[0]', () => {      
      tester.type(createCalendarWorkEntryRequest({
        prices: [1 as any],
      }), 'prices/0', 'object');

      tester.additionalProperties(createCalendarWorkEntryRequest({
        prices: [
          {
            ...createListedPriceRequest(),
            extra: 1,
          } as any,          
        ],
      }), 'prices/0');

      tester.additionalProperties(createCalendarWorkEntryRequest({
        prices: [
          {
            ...priceDataFactory.base(),
            extra: 1,
          } as any,       
        ],
      }), 'prices/0');
    });

    describe('if data.prices[0].priceId', () => {      
      tester.required(createCalendarWorkEntryRequest({
        prices: [
          createListedPriceRequest({
            priceId: undefined,
          }),
        ],
      }), 'priceId');

      tester.type(createCalendarWorkEntryRequest({
        prices: [
          createListedPriceRequest({
            priceId: 1 as any,
          }),
        ],
      }), 'priceId', 'string');

      tester.pattern(createCalendarWorkEntryRequest({
        prices: [
          createListedPriceRequest({
            priceId: priceDataFactory.id('not-mongo-id'),
          }),
        ],
      }), 'priceId');
    });

    describe('if data.prices[0].quantity', () => {      
      tester.required(createCalendarWorkEntryRequest({
        prices: [
          createListedPriceRequest({
            quantity: undefined,
          }),
        ],
      }), 'quantity');

      tester.type(createCalendarWorkEntryRequest({
        prices: [
          createListedPriceRequest({
            quantity: '1' as any,
          }),
        ],
      }), 'quantity', 'number');

      tester.exclusiveMinimum(createCalendarWorkEntryRequest({
        prices: [
          createListedPriceRequest({
            quantity: 0,
          }),
        ],
      }), 'quantity', 0);
    });

    describe('if data.prices[0].name', () => {      
      tester.required(createCalendarWorkEntryRequest({
        prices: [
          priceDataFactory.base({
            name: undefined,
          }),
        ],
      }), 'name');

      tester.type(createCalendarWorkEntryRequest({
        prices: [
          priceDataFactory.base({
            name: 1 as any,
          }),
        ],
      }), 'name', 'string');

      tester.minLength(createCalendarWorkEntryRequest({
        prices: [
          priceDataFactory.base({
            name: '',
          }),
        ],
      }), 'name', 1);
    });

    describe('if data.prices[0].amount', () => {      
      tester.required(createCalendarWorkEntryRequest({
        prices: [
          priceDataFactory.base({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.type(createCalendarWorkEntryRequest({
        prices: [
          priceDataFactory.base({
            amount: '1' as any,
          }),
        ],
      }), 'amount', 'integer');
    });
  });
});
