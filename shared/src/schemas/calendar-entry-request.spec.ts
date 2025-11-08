import { default as schema } from '@household/shared/schemas/calendar-entry-request';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CalendarEntryType } from '@household/shared/enums';

describe('Calendar personal entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.PersonalEntryRequest>(schema);
  tester.validateSuccess(testDataFactory.calendar.entry.request.personal());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.calendar.entry.request.personal(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(testDataFactory.calendar.entry.request.personal({
        day: undefined,
      }), 'day');

      tester.type(testDataFactory.calendar.entry.request.personal({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(testDataFactory.calendar.entry.request.personal({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(testDataFactory.calendar.entry.request.personal({
        title: undefined,
      }), 'title');

      tester.type(testDataFactory.calendar.entry.request.personal({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.personal({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.calendar.entry.request.personal({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.personal({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(testDataFactory.calendar.entry.request.personal({
        entryType: 1 as any,
      }), 'entryType', 'string');

      tester.const(testDataFactory.calendar.entry.request.personal({
        entryType: CalendarEntryType.Work as any,
      }), 'entryType');
    });

    describe('if data.start', () => {
      tester.required(testDataFactory.calendar.entry.request.personal({
        start: undefined,
      }), 'start');

      tester.type(testDataFactory.calendar.entry.request.personal({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(testDataFactory.calendar.entry.request.personal({
        start: -1,
      }), 'start', 0);

      tester.maximum(testDataFactory.calendar.entry.request.personal({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(testDataFactory.calendar.entry.request.personal({
        end: undefined,
      }), 'end');

      tester.type(testDataFactory.calendar.entry.request.personal({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(testDataFactory.calendar.entry.request.personal({
        end: -1,
      }), 'end', 0);

      tester.maximum(testDataFactory.calendar.entry.request.personal({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(testDataFactory.calendar.entry.request.personal({
        start: 20,
        end: 10,
      }), 'end', 20);
    });
  });
});

describe('Calendar issue entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.IssueEntryRequest>(schema);
  tester.validateSuccess(testDataFactory.calendar.entry.request.issue());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.calendar.entry.request.issue(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(testDataFactory.calendar.entry.request.issue({
        day: undefined,
      }), 'day');

      tester.type(testDataFactory.calendar.entry.request.issue({
        day: 1 as any,
      }), 'day', 'string');

      tester.format(testDataFactory.calendar.entry.request.issue({
        day: 'not-a-date',
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(testDataFactory.calendar.entry.request.issue({
        title: undefined,
      }), 'title');

      tester.type(testDataFactory.calendar.entry.request.issue({
        title: 1 as any,
      }), 'title', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.issue({
        title: '',
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.calendar.entry.request.issue({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.issue({
        description: '',
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(testDataFactory.calendar.entry.request.issue({
        entryType: 1 as any,
      }), 'entryType', 'string');

      tester.const(testDataFactory.calendar.entry.request.issue({
        entryType: CalendarEntryType.Work as any,
      }), 'entryType');
    });

    describe('if data.start', () => {
      tester.required(testDataFactory.calendar.entry.request.issue({
        start: undefined,
      }), 'start');

      tester.type(testDataFactory.calendar.entry.request.issue({
        start: '1' as any,
      }), 'start', 'integer');

      tester.minimum(testDataFactory.calendar.entry.request.issue({
        start: -1,
      }), 'start', 0);

      tester.maximum(testDataFactory.calendar.entry.request.issue({
        start: 97,
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(testDataFactory.calendar.entry.request.issue({
        end: undefined,
      }), 'end');

      tester.type(testDataFactory.calendar.entry.request.issue({
        end: '1' as any,
      }), 'end', 'integer');

      tester.minimum(testDataFactory.calendar.entry.request.issue({
        end: -1,
      }), 'end', 0);

      tester.maximum(testDataFactory.calendar.entry.request.issue({
        end: 97,
      }), 'end', 96);

      tester.exclusiveMinimum(testDataFactory.calendar.entry.request.issue({
        start: 20,
        end: 10,
      }), 'end', 20);
    });
  });
});

describe('Calendar work entry request schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.WorkEntryRequest>(schema);
  tester.validateSuccess(testDataFactory.calendar.entry.request.work({
    prices: {
      custom: [{}],
      listed: [{}],
    },
  }));
  tester.validateSuccess(testDataFactory.calendar.entry.request.work(), 'without prices');

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.calendar.entry.request.work(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required(testDataFactory.calendar.entry.request.work({
        body: {
          day: undefined,
        },
      }), 'day');

      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          day: 1 as any,
        },
      }), 'day', 'string');

      tester.format(testDataFactory.calendar.entry.request.work({
        body: {
          day: 'not-a-date',
        },
      }), 'day', 'date');
    });

    describe('if data.title', () => {
      tester.required(testDataFactory.calendar.entry.request.work({
        body: {
          title: undefined,
        },
      }), 'title');

      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          title: 1 as any,
        },
      }), 'title', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.work({
        body: {
          title: '',
        },
      }), 'title', 1);
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          description: 1 as any,
        },
      }), 'description', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.work({
        body: {
          description: '',
        },
      }), 'description', 1);
    });

    describe('if data.entryType', () => {
      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          entryType: 1 as any,
        },
      }), 'entryType', 'string');
    });

    describe('if data.start', () => {
      tester.required(testDataFactory.calendar.entry.request.work({
        body: {
          start: undefined,
        },
      }), 'start');

      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          start: '1' as any,
        },
      }), 'start', 'integer');

      tester.minimum(testDataFactory.calendar.entry.request.work({
        body: {
          start: -1,
        },
      }), 'start', 0);

      tester.maximum(testDataFactory.calendar.entry.request.work({
        body: {
          start: 97,
        },
      }), 'start', 96);
    });

    describe('if data.end', () => {
      tester.required(testDataFactory.calendar.entry.request.work({
        body: {
          end: undefined,
        },
      }), 'end');

      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          end: '1' as any,
        },
      }), 'end', 'integer');

      tester.minimum(testDataFactory.calendar.entry.request.work({
        body: {
          end: -1,
        },
      }), 'end', 0);

      tester.maximum(testDataFactory.calendar.entry.request.work({
        body: {
          end: 97,
        },
      }), 'end', 96);

      tester.exclusiveMinimum(testDataFactory.calendar.entry.request.work({
        body: {
          start: 20,
          end: 10,
        },
      }), 'end', 20);
    });

    describe('if data.customerId', () => {
      tester.required(testDataFactory.calendar.entry.request.work({
        body: {
          customerId: undefined,
        },
      }), 'customerId');

      tester.type(testDataFactory.calendar.entry.request.work({
        body: {
          customerId: 1 as any,
        },
      }), 'customerId', 'string');

      tester.pattern(testDataFactory.calendar.entry.request.work({
        body: {
          customerId: testDataFactory.customer.id('not-a-mongo-id'),
        },
      }), 'customerId');
    });

    describe('if data.prices', () => {
      tester.type({
        ...testDataFactory.calendar.entry.request.work(),
        prices: {} as any,
      }, 'prices', 'array');
      
      tester.minItems({
        ...testDataFactory.calendar.entry.request.work(),
        prices: [],
      }, 'prices', 1);
    });

    describe('if data.prices[0]', () => {      
      tester.type({
        ...testDataFactory.calendar.entry.request.work(),
        prices: [1] as any,
      }, 'prices/0', 'object');

      tester.additionalProperties({
        ...testDataFactory.calendar.entry.request.work(),
        prices: [
          {
            name: 'name',
            amount: 1000,
            extra: 1,
          } as any,
        ],
      }, 'prices/0');
    });

    describe('if data.prices[0].priceId', () => {      
      tester.required(testDataFactory.calendar.entry.request.work({
        prices: {
          listed: [
            {
              priceId: undefined,
            },
          ],
        },
      }), 'priceId');

      tester.type(testDataFactory.calendar.entry.request.work({
        prices: {
          listed: [
            {
              priceId: 1 as any,
            },
          ],
        },
      }), 'priceId', 'string');

      tester.pattern(testDataFactory.calendar.entry.request.work({
        prices: {
          listed: [
            {
              priceId: testDataFactory.price.id('not-mongo-id'),
            },
          ],
        },
      }), 'priceId');
    });

    describe('if data.prices[0].quantity', () => {      
      tester.required(testDataFactory.calendar.entry.request.work({
        prices: {
          listed: [
            {
              quantity: undefined,
            },
          ],
        },
      }), 'quantity');

      tester.type(testDataFactory.calendar.entry.request.work({
        prices: {
          listed: [
            {
              quantity: '1' as any,
            },
          ],
        },
      }), 'quantity', 'integer');

      tester.exclusiveMinimum(testDataFactory.calendar.entry.request.work({
        prices: {
          listed: [
            {
              quantity: 0,
            },
          ],
        },
      }), 'quantity', 0);
    });

    describe('if data.prices[0].name', () => {      
      tester.required(testDataFactory.calendar.entry.request.work({
        prices: {
          custom: [
            {
              name: undefined,
            },
          ],
        },
      }), 'name');

      tester.type(testDataFactory.calendar.entry.request.work({
        prices: {
          custom: [
            {
              name: 1 as any,
            },
          ],
        },
      }), 'name', 'string');

      tester.minLength(testDataFactory.calendar.entry.request.work({
        prices: {
          custom: [
            {
              name: '',
            },
          ],
        },
      }), 'name', 1);
    });

    describe('if data.prices[0].amount', () => {      
      tester.required(testDataFactory.calendar.entry.request.work({
        prices: {
          custom: [
            {
              amount: undefined,
            },
          ],
        },
      }), 'amount');

      tester.type(testDataFactory.calendar.entry.request.work({
        prices: {
          custom: [
            {
              amount: 1.1,
            },
          ],
        },
      }), 'amount', 'integer');
    });
  });
});
