import { default as schema } from '@household/shared/schemas/project';
import { Project } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Project schema', () => {
  let data: Project.Request;
  const tester = jsonSchemaTesterFactory<Project.Request>(schema);

  beforeEach(() => {
    data = {
      name: 'name',
      description: 'description',
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      tester.validateSuccess(data);
    });

    describe('without optional property', () => {
      it('description', () => {
        delete data.description;
        tester.validateSuccess(data);
      });
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.name', () => {
      it('is missing', () => {
        data.name = undefined;
        tester.validateSchemaRequired(data, 'name');
      });

      it('is not string', () => {
        (data.name as any) = 2;
        tester.validateSchemaType(data, 'name', 'string');
      });

      it('is too short', () => {
        data.name = '';
        tester.validateSchemaMinLength(data, 'name', 1);
      });
    });

    describe('if data.description', () => {
      it('is not string', () => {
        (data.description as any) = 2;
        tester.validateSchemaType(data, 'description', 'string');
      });

      it('is too short', () => {
        data.description = '';
        tester.validateSchemaMinLength(data, 'description', 1);
      });
    });
  });
});
