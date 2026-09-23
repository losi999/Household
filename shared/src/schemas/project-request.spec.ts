import { request as schema } from '@household/shared/schemas/project';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Project schema', () => {
  const tester = schemaTesterFactory<Requests.Project>(schema);
  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.project.request());

    tester.validateSuccess(testDataFactory.project.request({
      description: undefined,
    }), 'without description');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.project.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.project.request({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.project.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.project.request({
        name: '',
      }), 'name', 1);
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.project.request({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.project.request({
        description: '',
      }), 'description', 1);
    });
  });
});
