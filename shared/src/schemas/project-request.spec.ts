import { default as schema } from '@household/shared/schemas/project-request';
import { Project } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createProjectRequest } from '@household/shared/common/test-data-factory';

describe('Project schema', () => {
  const tester = jsonSchemaTesterFactory<Project.Request>(schema);
  describe('should accept', () => {
    tester.validateSuccess(createProjectRequest());

    describe('without optional property', () => {
      tester.validateSuccess(createProjectRequest({
        description: undefined,
      }));
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createProjectRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.validateSchemaRequired(createProjectRequest({
        name: undefined,
      }), 'name');

      tester.validateSchemaType(createProjectRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.validateSchemaMinLength(createProjectRequest({
        name: '',
      }), 'name', 1);
    });

    describe('if data.description', () => {
      tester.validateSchemaType(createProjectRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.validateSchemaMinLength(createProjectRequest({
        description: '',
      }), 'description', 1);
    });
  });
});
