import { default as handler } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.handler';
import { validateError } from '@household/shared/common/unit-testing';

describe('Bulk transaction importer handler', () => {
  let handlerFuntion: ReturnType<typeof handler>;
  let mockBulkTransactionImporterService: jest.Mock;

  const bucketName = 'bucket-name';
  const fileId = 'file.xls';

  const handlerEvent = {
    Records: [
      {
        s3: {
          bucket: {
            name: bucketName,
          },
          object: {
            key: fileId,
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
    expect(mockBulkTransactionImporterService).toHaveBeenCalledWith({
      bucketName,
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
    expect(mockBulkTransactionImporterService).toHaveBeenCalledWith({
      bucketName,
      fileId,
    });
    expect.assertions(2);
  });
});
