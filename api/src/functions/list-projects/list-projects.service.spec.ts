import { IListProjectsService, listProjectsServiceFactory } from '@household/api/functions/list-projects/list-projects.service';
import { createProjectDocument, createProjectResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';

describe('List projects service', () => {
  let service: IListProjectsService;
  let mockProjectService: Mock<IProjectService>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;

  beforeEach(() => {
    mockProjectService = createMockService('listProjects');
    mockProjectDocumentConverter = createMockService('toResponseList');

    service = listProjectsServiceFactory(mockProjectService.service, mockProjectDocumentConverter.service);
  });

  const queriedDocument = createProjectDocument();
  const convertedResponse = createProjectResponse();

  it('should return documents', async () => {
    mockProjectService.functions.listProjects.mockResolvedValue([queriedDocument]);
    mockProjectDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockProjectService.functions.listProjects).toHaveBeenCalled();
    validateFunctionCall(mockProjectDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query projects', async () => {
      mockProjectService.functions.listProjects.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing projects', 500));
      expect(mockProjectService.functions.listProjects).toHaveBeenCalled();
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
