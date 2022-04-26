import { ICreateProjectService, createProjectServiceFactory } from '@household/api/functions/create-project/create-project.service';
import { createProjectRequest, createProjectDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Types } from 'mongoose';
describe('Create project service', () => {
  let service: ICreateProjectService;
  let mockProjectService: Mock<IProjectService>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;

  beforeEach(() => {
    mockProjectService = createMockService('saveProject');
    mockProjectDocumentConverter = createMockService('create');

    service = createProjectServiceFactory(mockProjectService.service, mockProjectDocumentConverter.service);
  });

  const body = createProjectRequest();
  const projectId = new Types.ObjectId();
  const convertedProjectDocument = createProjectDocument({
    _id: projectId,
  });

  it('should return new id', async () => {
    mockProjectDocumentConverter.functions.create.mockReturnValue(convertedProjectDocument);
    mockProjectService.functions.saveProject.mockResolvedValue(convertedProjectDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(projectId.toString()),
    validateFunctionCall(mockProjectDocumentConverter.functions.create, body, undefined);
    validateFunctionCall(mockProjectService.functions.saveProject, convertedProjectDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to save document', async () => {
      mockProjectDocumentConverter.functions.create.mockReturnValue(convertedProjectDocument);
      mockProjectService.functions.saveProject.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving project', 500));
      validateFunctionCall(mockProjectDocumentConverter.functions.create, body, undefined);
      validateFunctionCall(mockProjectService.functions.saveProject, convertedProjectDocument);
      expect.assertions(4);
    });
  });
});
