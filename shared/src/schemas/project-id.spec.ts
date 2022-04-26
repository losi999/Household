import { default as schema } from '@household/shared/schemas/project-id';
import { validateSchemaAdditionalProperties, validateSchemaPattern, validateSchemaRequired } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Project } from '@household/shared/types/types';
import { createProjectId } from '@household/shared/common/test-data-factory';

describe('Project id schema', () => {
  let data: Project.Id;

  beforeEach(() => {
    data = {
      projectId: createProjectId('62378f3a6add840bbd4c630c'),
    };
  });

  it('should accept valid body', () => {
    const result = validatorService.validate(data, schema);
    expect(result).toBeUndefined();
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'data');
      });
    });

    describe('if data.projectId', () => {
      it('is missing', () => {
        data.projectId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'projectId');
      });

      it('does not match pattern', () => {
        data.projectId = createProjectId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'projectId');
      });
    });
  });
});
