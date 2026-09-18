import { idList as schema } from '@household/shared/schemas/recipient';
import { Api } from '@household/shared/types/api';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Recipient id list schema', () => {
  const tester = schemaTesterFactory<Api.Recipient.Id[]>(schema);

  tester.validateSuccess([testDataFactory.recipient.id()]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.type(0 as any, 'data', 'array');

      tester.minItems([], 'data', 1);
    });

    describe('if data[0]', () => {
      tester.type([1 as any], 'data/0', 'string');

      tester.pattern([testDataFactory.recipient.id('not-valid')], 'data/0');
    });
  });
});
