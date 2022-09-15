import { IPostDeployService, postDeployServiceFactory } from '@household/api/functions/post-deploy/post-deploy.service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IInfrastructureService } from '@household/shared/services/infrastructure-service';

describe('Post deploy service', () => {
  let service: IPostDeployService;
  let mockInfrastructureService: Mock<IInfrastructureService>;

  beforeEach(() => {
    mockInfrastructureService = createMockService('executePostDeployFunctions');

    service = postDeployServiceFactory(mockInfrastructureService.service);
  });

  const stackName = 'stackName';

  it('should return undefined if every post deploy function is executed successfully', async () => {
    mockInfrastructureService.functions.executePostDeployFunctions.mockResolvedValue(undefined);

    const result = await service({
      stackName,
    });
    expect(result).toBeUndefined();
    validateFunctionCall(mockInfrastructureService.functions.executePostDeployFunctions, stackName);
    expect.assertions(2);
  });

  it('should throw error if a post deploy function fails', async () => {
    const errorMessage = 'This is an error';
    mockInfrastructureService.functions.executePostDeployFunctions.mockRejectedValue({
      message: errorMessage,
    });

    await service({
      stackName,
    }).catch(validateError(errorMessage));
    validateFunctionCall(mockInfrastructureService.functions.executePostDeployFunctions, stackName);
    expect.assertions(2);
  });
});
