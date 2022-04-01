import { MockBusinessService, validateError } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/database-archive/database-archive.handler';
import { IDatabaseArchiveService } from '@household/api/functions/database-archive/database-archive.service';

describe('Database archive handler', () => {
  let mockDatabaseArchiveService: MockBusinessService<IDatabaseArchiveService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDatabaseArchiveService = jest.fn();
    handlerFunction = handler(mockDatabaseArchiveService);
  });

  it('should return successfully', async () => {
    mockDatabaseArchiveService.mockResolvedValue(undefined);

    await handlerFunction(undefined, undefined, undefined);

    expect(mockDatabaseArchiveService).toHaveBeenCalled();
  });

  it('should throw error', async () => {
    mockDatabaseArchiveService.mockRejectedValue({
      message: 'this is an error',
    });

    await (handlerFunction(undefined, undefined, undefined) as Promise<void>).catch(validateError('this is an error'));

    expect(mockDatabaseArchiveService).toHaveBeenCalled();
  });
});
