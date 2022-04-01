import { IDeleteProjectService, deleteProjectServiceFactory } from '@household/api/functions/delete-project/delete-project.service';
import { createProjectId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProjectService } from '@household/shared/services/project-service';

describe('Delete project service', () => {
  let service: IDeleteProjectService;
  let mockProjectService: Mock<IProjectService>;

  beforeEach(() => {
    mockProjectService = createMockService('deleteProject');

    service = deleteProjectServiceFactory(mockProjectService.service);
  });

  const projectId = createProjectId();

  it('should return if document is deleted', async () => {
    mockProjectService.functions.deleteProject.mockResolvedValue(undefined);

    await service({
      projectId,
    });
    validateFunctionCall(mockProjectService.functions.deleteProject, projectId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockProjectService.functions.deleteProject.mockRejectedValue('this is a mongo error');

      await service({
        projectId,
      }).catch(validateError('Error while deleting project', 500));
      validateFunctionCall(mockProjectService.functions.deleteProject, projectId);
      expect.assertions(3);
    });
  });
});
