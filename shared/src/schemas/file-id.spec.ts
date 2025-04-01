import { default as schema } from '@household/shared/schemas/project-id';
import { File } from '@household/shared/types/types';
import { createFileId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('File id schema', () => {
  const tester = jsonSchemaTesterFactory<File.FileId>(schema);

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
