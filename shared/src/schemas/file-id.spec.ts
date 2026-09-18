import { fileId as schema } from '@household/shared/schemas/file';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('File id schema', () => {
  const tester = schemaTesterFactory<Api.File.FileId>(schema);

  tester.validateSuccess({
    fileId: testDataFactory.file.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        fileId: testDataFactory.file.id(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.fileId', () => {
      tester.required({
        fileId: undefined,
      }, 'fileId');

      tester.type({
        fileId: 1 as any,
      }, 'fileId', 'string');

      tester.pattern({
        fileId: testDataFactory.file.id('not-valid'),
      }, 'fileId');
    });
  });
});
