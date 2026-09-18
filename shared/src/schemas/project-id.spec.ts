import { projectId as schema } from '@household/shared/schemas/project';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Project id schema', () => {
  const tester = schemaTesterFactory<Api.Project.ProjectId>(schema);

  tester.validateSuccess({
    projectId: testDataFactory.project.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        projectId: testDataFactory.project.id(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.projectId', () => {
      tester.required({
        projectId: undefined,
      }, 'projectId');

      tester.type({
        projectId: 1 as any,
      }, 'projectId', 'string');

      tester.pattern({
        projectId: testDataFactory.project.id('not-valid'),
      }, 'projectId');
    });
  });
});
