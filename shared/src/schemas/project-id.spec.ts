import { default as schema } from '@household/shared/schemas/project-id';
import { Project } from '@household/shared/types/types';
import { createProjectId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Project id schema', () => {
  let data: Project.Id;
  const tester = jsonSchemaTesterFactory<Project.Id>(schema);

  beforeEach(() => {
    data = {
      projectId: createProjectId('62378f3a6add840bbd4c630c'),
    };
  });

  it('should accept valid body', () => {
    tester.validateSuccess(data);
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.projectId', () => {
      it('is missing', () => {
        data.projectId = undefined;
        tester.validateSchemaRequired(data, 'projectId');
      });

      it('does not match pattern', () => {
        data.projectId = createProjectId();
        tester.validateSchemaPattern(data, 'projectId');
      });
    });
  });
});
