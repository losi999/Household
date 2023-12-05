import { default as schema } from '@household/shared/schemas/project-id-list';
import { Project } from '@household/shared/types/types';
import { createProjectId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Project id list schema', () => {
  const tester = jsonSchemaTesterFactory<Project.Id[]>(schema);

  tester.validateSuccess([createProjectId()]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaType(0 as any, 'data', 'array');

      tester.validateSchemaMinItems([], 'data', 1);
    });

    describe('if data[0]', () => {
      tester.validateSchemaType([1 as any], 'data/0', 'string');

      tester.validateSchemaPattern([createProjectId('not-valid')], 'data/0');
    });
  });
});
