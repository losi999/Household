import { default as schema } from '@household/shared/schemas/calendar-entry-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { customerDataFactory, createListedPriceRequest, priceDataFactory, calendarEntryDataFactory } from '@household/shared/common/test-data-factory';
import { CalendarEntryType } from '@household/shared/enums';

describe('Calendar personal entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.PersonalEntryRequest>(schema);
  tester.validateSuccess(calendarEntryDataFactory.personalRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarEntryDataFactory.personalRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(calendarEntryDataFactory.personalRequest({
        day: undefined,
      }), 'day');

      tester.type(calendarEntryDataFactory.personalRequest({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(calendarEntryDataFactory.personalRequest({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(calendarEntryDataFactory.personalRequest({
        title: undefined,
      }), 'title');

      tester.type(calendarEntryDataFactory.personalRequest({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(calendarEntryDataFactory.personalRequest({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(calendarEntryDataFactory.personalRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(calendarEntryDataFactory.personalRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(calendarEntryDataFactory.personalRequest({
        entryType: 1 as any,
      }), 'entryType', 'string');

      tester.const(calendarEntryDataFactory.personalRequest({
        entryType: CalendarEntryType.Work as any,
      }), 'entryType');
    });

    describe('if data.start', () => {
      tester.required(calendarEntryDataFactory.personalRequest({
        start: undefined,
      }), 'start');

      tester.type(calendarEntryDataFactory.personalRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(calendarEntryDataFactory.personalRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(calendarEntryDataFactory.personalRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(calendarEntryDataFactory.personalRequest({
        end: undefined,
      }), 'end');

      tester.type(calendarEntryDataFactory.personalRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(calendarEntryDataFactory.personalRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(calendarEntryDataFactory.personalRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(calendarEntryDataFactory.personalRequest({
        start: 20,
        end: 10,
      }), 'end', 20);
    });
  });
});

describe('Calendar issue entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.IssueEntryRequest>(schema);
  tester.validateSuccess(calendarEntryDataFactory.issueRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarEntryDataFactory.issueRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(calendarEntryDataFactory.issueRequest({
        day: undefined,
      }), 'day');

      tester.type(calendarEntryDataFactory.issueRequest({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(calendarEntryDataFactory.issueRequest({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(calendarEntryDataFactory.issueRequest({
        title: undefined,
      }), 'title');

      tester.type(calendarEntryDataFactory.issueRequest({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(calendarEntryDataFactory.issueRequest({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(calendarEntryDataFactory.issueRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(calendarEntryDataFactory.issueRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(calendarEntryDataFactory.issueRequest({
        entryType: 1 as any,
      }), 'entryType', 'string');

      tester.const(calendarEntryDataFactory.issueRequest({
        entryType: CalendarEntryType.Work as any,
      }), 'entryType');
    });

    describe('if data.start', () => {
      tester.required(calendarEntryDataFactory.issueRequest({
        start: undefined,
      }), 'start');

      tester.type(calendarEntryDataFactory.issueRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(calendarEntryDataFactory.issueRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(calendarEntryDataFactory.issueRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(calendarEntryDataFactory.issueRequest({
        end: undefined,
      }), 'end');

      tester.type(calendarEntryDataFactory.issueRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(calendarEntryDataFactory.issueRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(calendarEntryDataFactory.issueRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(calendarEntryDataFactory.issueRequest({
        start: 20,
        end: 10,
      }), 'end', 20);
    });
  });
});

describe('Calendar work entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.WorkEntryRequest>(schema);
  tester.validateSuccess(calendarEntryDataFactory.workRequest());
  tester.validateSuccess(calendarEntryDataFactory.workRequest({
    prices: undefined,
  }), 'without prices');

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...calendarEntryDataFactory.workRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(calendarEntryDataFactory.workRequest({
        day: undefined,
      }), 'day');

      tester.type(calendarEntryDataFactory.workRequest({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(calendarEntryDataFactory.workRequest({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(calendarEntryDataFactory.workRequest({
        title: undefined,
      }), 'title');

      tester.type(calendarEntryDataFactory.workRequest({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(calendarEntryDataFactory.workRequest({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(calendarEntryDataFactory.workRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(calendarEntryDataFactory.workRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(calendarEntryDataFactory.workRequest({
        entryType: 1 as any,
      }), 'entryType', 'string');
    });

    describe('if data.start', () => {
      tester.required(calendarEntryDataFactory.workRequest({
        start: undefined,
      }), 'start');

      tester.type(calendarEntryDataFactory.workRequest({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(calendarEntryDataFactory.workRequest({
        start: -1,
      }), 'start', 0);

      tester.maximum(calendarEntryDataFactory.workRequest({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(calendarEntryDataFactory.workRequest({
        end: undefined,
      }), 'end');

      tester.type(calendarEntryDataFactory.workRequest({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(calendarEntryDataFactory.workRequest({
        end: -1,
      }), 'end', 0);

      tester.maximum(calendarEntryDataFactory.workRequest({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(calendarEntryDataFactory.workRequest({
        start: 20,
        end: 10,
      }), 'end', 20);
    });

    describe('if data.customerId', () => {
      tester.required(calendarEntryDataFactory.workRequest({
        customerId: undefined,
      }), 'customerId');

      tester.type(calendarEntryDataFactory.workRequest({
        customerId: 1 as any,
      }), 'customerId', 'string');

      tester.pattern(calendarEntryDataFactory.workRequest({
        customerId: customerDataFactory.id('not-a-mongo-id'),
      }), 'customerId');
    });

    describe('if data.prices', () => {
      tester.type(calendarEntryDataFactory.workRequest({
        prices: {} as any,
      }), 'prices', 'array');
      
      tester.minItems(calendarEntryDataFactory.workRequest({
        prices: [],
      }), 'prices', 1);
    });

    describe('if data.prices[0]', () => {      
      tester.type(calendarEntryDataFactory.workRequest({
        prices: [1 as any],
      }), 'prices/0', 'object');

      tester.additionalProperties(calendarEntryDataFactory.workRequest({
        prices: [
          {
            ...createListedPriceRequest(),
            extra: 1,
          } as any,          
        ],
      }), 'prices/0');

      tester.additionalProperties(calendarEntryDataFactory.workRequest({
        prices: [
          {
            ...priceDataFactory.base(),
            extra: 1,
          } as any,       
        ],
      }), 'prices/0');
    });

    describe('if data.prices[0].priceId', () => {      
      tester.required(calendarEntryDataFactory.workRequest({
        prices: [
          createListedPriceRequest({
            priceId: undefined,
          }),
        ],
      }), 'priceId');

      tester.type(calendarEntryDataFactory.workRequest({
        prices: [
          createListedPriceRequest({
            priceId: 1 as any,
          }),
        ],
      }), 'priceId', 'string');

      tester.pattern(calendarEntryDataFactory.workRequest({
        prices: [
          createListedPriceRequest({
            priceId: priceDataFactory.id('not-mongo-id'),
          }),
        ],
      }), 'priceId');
    });

    describe('if data.prices[0].quantity', () => {      
      tester.required(calendarEntryDataFactory.workRequest({
        prices: [
          createListedPriceRequest({
            quantity: undefined,
          }),
        ],
      }), 'quantity');

      tester.type(calendarEntryDataFactory.workRequest({
        prices: [
          createListedPriceRequest({
            quantity: '1' as any,
          }),
        ],
      }), 'quantity', 'number');

      tester.exclusiveMinimum(calendarEntryDataFactory.workRequest({
        prices: [
          createListedPriceRequest({
            quantity: 0,
          }),
        ],
      }), 'quantity', 0);
    });

    describe('if data.prices[0].name', () => {      
      tester.required(calendarEntryDataFactory.workRequest({
        prices: [
          priceDataFactory.base({
            name: undefined,
          }),
        ],
      }), 'name');

      tester.type(calendarEntryDataFactory.workRequest({
        prices: [
          priceDataFactory.base({
            name: 1 as any,
          }),
        ],
      }), 'name', 'string');

      tester.minLength(calendarEntryDataFactory.workRequest({
        prices: [
          priceDataFactory.base({
            name: '',
          }),
        ],
      }), 'name', 1);
    });

    describe('if data.prices[0].amount', () => {      
      tester.required(calendarEntryDataFactory.workRequest({
        prices: [
          priceDataFactory.base({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.type(calendarEntryDataFactory.workRequest({
        prices: [
          priceDataFactory.base({
            amount: '1' as any,
          }),
        ],
      }), 'amount', 'integer');
    });
  });
});
