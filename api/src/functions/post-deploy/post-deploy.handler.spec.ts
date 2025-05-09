import { default as handler } from '@household/api/functions/post-deploy/post-deploy.handler';
import { IPostDeployService } from '@household/api/functions/post-deploy/post-deploy.service';
import { MockBusinessService, validateError } from '@household/shared/common/unit-testing';

describe('Post deploy handler', () => {
  let handlerFuntion: ReturnType<typeof handler>;
  let mockPostDeployService: MockBusinessService<IPostDeployService>;

  const infrastructureStack = 'stackName';

  beforeEach(() => {
    mockPostDeployService = jest.fn();

    process.env.INFRASTRUCTURE_STACK = infrastructureStack;

    handlerFuntion = handler(mockPostDeployService);
  });

  it('should return undefined if post deploy service executes successfully', async () => {
    mockPostDeployService.mockResolvedValue(undefined);

    const result = await handlerFuntion(undefined, undefined, undefined);
    expect(result).toBeUndefined();
    expect(mockPostDeployService).toHaveBeenCalledWith({
      stackName: infrastructureStack,
    });
    expect.assertions(2);
  });

  it('should throw error if post deploy service fails', async () => {
    const errorMessage = 'This is an error';
    mockPostDeployService.mockRejectedValue({
      message: errorMessage,
    });

    await (handlerFuntion(undefined, undefined, undefined) as Promise<any>).catch(validateError(errorMessage));
    expect(mockPostDeployService).toHaveBeenCalledWith({
      stackName: infrastructureStack,
    });
    expect.assertions(2);
  });
});
