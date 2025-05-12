import { default as handler } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.handler';
import { IBulkTransactionImporterService } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.service';
import { createFileId } from '@household/shared/common/test-data-factory';
import { MockBusinessService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Bulk transaction importer handler', () => {
  let handlerFuntion: ReturnType<typeof handler>;
  let mockBulkTransactionImporterService: MockBusinessService<IBulkTransactionImporterService>;

  const fileId = createFileId();

  const handlerEvent = {
    Records: [
      {
        s3: {
          object: {
            key: fileId as string,
          },
        },
      },
    ],
  } as AWSLambda.S3Event;

  beforeEach(() => {
    mockBulkTransactionImporterService = jest.fn();

    handlerFuntion = handler(mockBulkTransactionImporterService);
  });

  it('should return undefined if post deploy service executes successfully', async () => {
    mockBulkTransactionImporterService.mockResolvedValue(undefined);

    const result = await handlerFuntion(handlerEvent, undefined, undefined);
    expect(result).toBeUndefined();
    validateFunctionCall(mockBulkTransactionImporterService, {
      fileId,
    });
    expect.assertions(2);
  });

  it('should throw error if post deploy service fails', async () => {
    const errorMessage = 'This is an error';
    mockBulkTransactionImporterService.mockRejectedValue({
      message: errorMessage,
    });

    await (handlerFuntion(handlerEvent, undefined, undefined) as Promise<any>).catch(validateError(errorMessage));
    validateFunctionCall(mockBulkTransactionImporterService, {
      fileId,
    });
    expect.assertions(2);
  });
});
