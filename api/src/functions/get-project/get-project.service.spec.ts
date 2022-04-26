import { IGetProjectService, getProjectServiceFactory } from '@household/api/functions/get-project/get-project.service';
import { createProjectId, createProjectDocument, createProjectResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
describe('Get project service', () => {
  let service: IGetProjectService;
  let mockProjectService: Mock<IProjectService>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;

  beforeEach(() => {
    mockProjectService = createMockService('getProjectById');
    mockProjectDocumentConverter = createMockService('toResponse');

    service = getProjectServiceFactory(mockProjectService.service, mockProjectDocumentConverter.service);
  });

  const projectId = createProjectId();
  const queriedDocument = createProjectDocument();
  const convertedResponse = createProjectResponse();

  it('should return project', async () => {
    mockProjectService.functions.getProjectById.mockResolvedValue(queriedDocument);
    mockProjectDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      projectId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockProjectService.functions.getProjectById, projectId);
    validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query project', async () => {
      mockProjectService.functions.getProjectById.mockRejectedValue('this is a mongo error');

      await service({
        projectId,
      }).catch(validateError('Error while getting project', 500));
      validateFunctionCall(mockProjectService.functions.getProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no project found', async () => {
      mockProjectService.functions.getProjectById.mockResolvedValue(undefined);

      await service({
        projectId,
      }).catch(validateError('No project found', 404));
      validateFunctionCall(mockProjectService.functions.getProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
