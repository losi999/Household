import { fileId as schema } from '@household/shared/schemas/file';
import { createFileId } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('File id schema', () => {
  const tester = schemaTesterFactory<Api.File.FileId>(schema);

  tester.validateSuccess({
    fileId: createFileId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        fileId: createFileId(),
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
        fileId: createFileId('not-valid'),
      }, 'fileId');
    });
  });
});
