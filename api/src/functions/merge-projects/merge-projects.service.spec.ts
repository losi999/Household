import { IMergeProjectsService, mergeProjectsServiceFactory } from '@household/api/functions/merge-projects/merge-projects.service';
import { createProjectDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProjectId } from '@household/shared/common/utils';
import { IProjectService } from '@household/shared/services/project-service';

describe('Merge project service', () => {
  let service: IMergeProjectsService;
  let mockProjectService: Mock<IProjectService>;

  beforeEach(() => {
    mockProjectService = createMockService('findProjectsByIds', 'mergeProjects');

    service = mergeProjectsServiceFactory(mockProjectService.service);
  });

  const targetProjectDocument = createProjectDocument();
  const sourceProjectDocument = createProjectDocument();
  const sourceProjectId = getProjectId(sourceProjectDocument);
  const projectId = getProjectId(targetProjectDocument);
  const body = [sourceProjectId];

  it('should return if projects are merged', async () => {
    mockProjectService.functions.findProjectsByIds.mockResolvedValue([
      targetProjectDocument,
      sourceProjectDocument,
    ]);
    mockProjectService.functions.mergeProjects.mockResolvedValue(undefined);

    await service({
      body,
      projectId,
    });
    validateFunctionCall(mockProjectService.functions.findProjectsByIds, [
      projectId,
      sourceProjectId,
    ]);
    validateFunctionCall(mockProjectService.functions.mergeProjects, {
      sourceProjectIds: body,
      targetProjectId: projectId,
    });
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if target project is among source projects', async () => {
      await service({
        body: [
          projectId,
          sourceProjectId,
        ],
        projectId,
      }).catch(validateError('Target project is among the source project Ids', 400));
      validateFunctionCall(mockProjectService.functions.findProjectsByIds);
      validateFunctionCall(mockProjectService.functions.mergeProjects);
      expect.assertions(4);
    });

    it('if unable to query projects', async () => {
      mockProjectService.functions.findProjectsByIds.mockRejectedValue('This is a mongo error');

      await service({
        body,
        projectId,
      }).catch(validateError('Error while listing projects by ids', 500));
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [
        projectId,
        sourceProjectId,
      ]);
      validateFunctionCall(mockProjectService.functions.mergeProjects);
      expect.assertions(4);
    });

    it('if some of the projects not found', async () => {
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([sourceProjectDocument]);
      mockProjectService.functions.mergeProjects.mockResolvedValue(undefined);

      await service({
        body,
        projectId,
      }).catch(validateError('Some of the projects are not found', 400));
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [
        projectId,
        sourceProjectId,
      ]);
      validateFunctionCall(mockProjectService.functions.mergeProjects);
      expect.assertions(4);
    });

    it('if unable to merge projects', async () => {
      mockProjectService.functions.findProjectsByIds.mockResolvedValue([
        targetProjectDocument,
        sourceProjectDocument,
      ]);
      mockProjectService.functions.mergeProjects.mockRejectedValue('This is a mongo error');

      await service({
        body,
        projectId,
      }).catch(validateError('Error while merging projects', 500));
      validateFunctionCall(mockProjectService.functions.findProjectsByIds, [
        projectId,
        sourceProjectId,
      ]);
      validateFunctionCall(mockProjectService.functions.mergeProjects, {
        sourceProjectIds: body,
        targetProjectId: projectId,
      });
      expect.assertions(4);
    });
  });
});
