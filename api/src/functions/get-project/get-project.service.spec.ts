import { IGetProjectService, getProjectServiceFactory } from '@household/api/functions/get-project/get-project.service';
import { createProjectDocument, createProjectResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProjectId } from '@household/shared/common/utils';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
describe('Get project service', () => {
  let service: IGetProjectService;
  let mockProjectService: Mock<IProjectService>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;

  beforeEach(() => {
    mockProjectService = createMockService('findProjectById');
    mockProjectDocumentConverter = createMockService('toResponse');

    service = getProjectServiceFactory(mockProjectService.service, mockProjectDocumentConverter.service);
  });

  const queriedDocument = createProjectDocument();
  const projectId = getProjectId(queriedDocument);
  const convertedResponse = createProjectResponse();

  it('should return project', async () => {
    mockProjectService.functions.findProjectById.mockResolvedValue(queriedDocument);
    mockProjectDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      projectId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
    validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query project', async () => {
      mockProjectService.functions.findProjectById.mockRejectedValue('this is a mongo error');

      await service({
        projectId,
      }).catch(validateError('Error while getting project', 500));
      validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no project found', async () => {
      mockProjectService.functions.findProjectById.mockResolvedValue(undefined);

      await service({
        projectId,
      }).catch(validateError('No project found', 404));
      validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
