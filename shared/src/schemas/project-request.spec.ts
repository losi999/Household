import { request as schema } from '@household/shared/schemas/project';
import { Requests } from '@household/shared/types/requests';
import { createProjectRequest } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Project schema', () => {
  const tester = schemaTesterFactory<Requests.Project>(schema);
  describe('should accept', () => {
    tester.validateSuccess(createProjectRequest());

    tester.validateSuccess(createProjectRequest({
      description: undefined,
    }), 'without description');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createProjectRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(createProjectRequest({
        name: undefined,
      }), 'name');

      tester.type(createProjectRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(createProjectRequest({
        name: '',
      }), 'name', 1);
    });

    describe('if data.description', () => {
      tester.type(createProjectRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createProjectRequest({
        description: '',
      }), 'description', 1);
    });
  });
});
