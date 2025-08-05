import { IUpdateProjectService, updateProjectServiceFactory } from '@household/api/functions/update-project/update-project.service';
import { createProjectRequest, createProjectDocument, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProjectId } from '@household/shared/common/utils';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';

describe('Update project service', () => {
  let service: IUpdateProjectService;
  let mockProjectService: Mock<IProjectService>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;

  beforeEach(() => {
    mockProjectService = createMockService('findProjectById', 'updateProject');
    mockProjectDocumentConverter = createMockService('update');

    service = updateProjectServiceFactory(mockProjectService.service, mockProjectDocumentConverter.service);
  });

  const body = createProjectRequest();
  const queriedDocument = createProjectDocument();
  const projectId = getProjectId(queriedDocument);
  const updateQuery = createDocumentUpdate({
    name: 'updated',
  });

  it('should return if project is updated', async () => {
    mockProjectService.functions.findProjectById.mockResolvedValue(queriedDocument);
    mockProjectDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockProjectService.functions.updateProject.mockResolvedValue(undefined);

    await service({
      body,
      projectId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
    validateFunctionCall(mockProjectDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockProjectService.functions.updateProject, projectId, updateQuery);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query project', async () => {
      mockProjectService.functions.findProjectById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        projectId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting project', 500));
      validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.update);
      validateFunctionCall(mockProjectService.functions.updateProject);
      expect.assertions(5);
    });

    it('if project not found', async () => {
      mockProjectService.functions.findProjectById.mockResolvedValue(undefined);

      await service({
        body,
        projectId,
        expiresIn: undefined,
      }).catch(validateError('No project found', 404));
      validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.update);
      validateFunctionCall(mockProjectService.functions.updateProject);
      expect.assertions(5);
    });

    it('if unable to update project', async () => {
      mockProjectService.functions.findProjectById.mockResolvedValue(queriedDocument);
      mockProjectDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockProjectService.functions.updateProject.mockRejectedValue('this is a mongo error');

      await service({
        body,
        projectId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating project', 500));
      validateFunctionCall(mockProjectService.functions.findProjectById, projectId);
      validateFunctionCall(mockProjectDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockProjectService.functions.updateProject, projectId, updateQuery);
      expect.assertions(5);
    });
  });
});
