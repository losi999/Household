import { default as schema } from '@household/shared/schemas/project-id';
import { Project } from '@household/shared/types/types';
import { createProjectId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Project id schema', () => {
  const tester = jsonSchemaTesterFactory<Project.ProjectId>(schema);

  tester.validateSuccess({
    projectId: createProjectId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        projectId: createProjectId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.projectId', () => {
      tester.validateSchemaRequired({
        projectId: undefined,
      }, 'projectId');

      tester.validateSchemaType({
        projectId: 1 as any,
      }, 'projectId', 'string');

      tester.validateSchemaPattern({
        projectId: createProjectId('not-valid'),
      }, 'projectId');
    });
  });
});
