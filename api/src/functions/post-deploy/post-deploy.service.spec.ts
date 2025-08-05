import { IPostDeployService, postDeployServiceFactory } from '@household/api/functions/post-deploy/post-deploy.service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IInfrastructureService } from '@household/shared/services/infrastructure-service';
import { IMongodbService } from '@household/shared/services/mongodb-service';

describe('Post deploy service', () => {
  let service: IPostDeployService;
  let mockInfrastructureService: Mock<IInfrastructureService>;
  let mockMongodbService: Mock<IMongodbService>;

  beforeEach(() => {
    mockInfrastructureService = createMockService('executePostDeployFunctions');
    mockMongodbService = createMockService('syncIndexes');

    service = postDeployServiceFactory(mockMongodbService.service, mockInfrastructureService.service);
  });

  const stackName = 'stackName';

  it('should return undefined if every post deploy function is executed successfully', async () => {
    mockInfrastructureService.functions.executePostDeployFunctions.mockResolvedValue(undefined);
    mockMongodbService.functions.syncIndexes.mockResolvedValue(undefined);

    const result = await service({
      stackName,
    });
    expect(result).toBeUndefined();
    expect(mockMongodbService.functions.syncIndexes).toHaveBeenCalledTimes(1);
    validateFunctionCall(mockInfrastructureService.functions.executePostDeployFunctions, stackName);
    expect.assertions(3);
  });

  it('should throw error if a post deploy function fails', async () => {
    const errorMessage = 'This is an error';
    mockMongodbService.functions.syncIndexes.mockResolvedValue(undefined);
    mockInfrastructureService.functions.executePostDeployFunctions.mockRejectedValue({
      message: errorMessage,
    });

    await service({
      stackName,
    }).catch(validateError(errorMessage));
    expect(mockMongodbService.functions.syncIndexes).toHaveBeenCalledTimes(1);
    validateFunctionCall(mockInfrastructureService.functions.executePostDeployFunctions, stackName);
    expect.assertions(3);
  });
});
