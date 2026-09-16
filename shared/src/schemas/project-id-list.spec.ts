import { idList as schema } from '@household/shared/schemas/project';
import { createProjectId } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Project id list schema', () => {
  const tester = schemaTesterFactory<Api.Project.Id[]>(schema);

  tester.validateSuccess([createProjectId()]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.type(0 as any, 'data', 'array');

      tester.minItems([], 'data', 1);
    });

    describe('if data[0]', () => {
      tester.type([1 as any], 'data/0', 'string');

      tester.pattern([createProjectId('not-valid')], 'data/0');
    });
  });
});
