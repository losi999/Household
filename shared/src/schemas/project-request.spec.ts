import { default as schema } from '@household/shared/schemas/project-request';
import { Project } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createProjectRequest } from '@household/shared/common/test-data-factory';

describe('Project schema', () => {
  const tester = jsonSchemaTesterFactory<Project.Request>(schema);
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
