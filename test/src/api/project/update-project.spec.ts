import { entries, getProjectId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/api/utils';
import { test, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { Project } from '@household/shared/types/types';
import { projectService } from '@household/test/api/dependencies';

const permissionMap = allowUsers('editor');

test.describe('PUT /project/v1/projects/{projectId}', () => {
  let req: Project.Request;
  let projectDocument: Project.Document;

  test.beforeEach(() => {
    req = projectDataFactory.request();

    projectDocument = projectDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestUpdateProject }) => {
      const res = await requestUpdateProject(projectDataFactory.id(), req);
      apiExpect(res).toBeUnauthorizedResponse();
    });
  });

  for (const [
    userType,
    isAllowed,
  ] of entries(permissionMap)) {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType,
      });

      if (!isAllowed) {
        test('should return forbidden', async ({ requestUpdateProject }) => {
          const res = await requestUpdateProject(projectDataFactory.id(), req);
          apiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update project', () => {
          test('with complete body', async ({ requestUpdateProject }) => {
            await projectService.saveProject(projectDocument);

            const res = await requestUpdateProject(getProjectId(projectDocument), req);
            apiExpect(res).toBeCreatedResponse();

            const { projectId } = (await res.json()) as Project.ProjectId;
            projectApiExpect(req).toBeStoredInDatabase(await projectService.findProjectById(projectId));
          });

          test.describe('without optional property in body', () => {
            test('description', async ({ requestUpdateProject }) => {
              await projectService.saveProject(projectDocument);

              req = projectDataFactory.request({
                description: undefined,
              });

              const res = await requestUpdateProject(getProjectId(projectDocument), req);
              apiExpect(res).toBeCreatedResponse();
              
              const { projectId } = (await res.json()) as Project.ProjectId;
              projectApiExpect(req).toBeStoredInDatabase(await projectService.findProjectById(projectId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id(), {
                ...req,
                extraProperty: 'extra',
              } as any);
  
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                name: undefined,
              }));

              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });
            
            test('is not string', async({ requestUpdateProject }) => {
              
              const res = await requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                name: <any>1,
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                name: '',
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different project', async ({ requestUpdateProject }) => {
              const duplicateProjectDocument = projectDataFactory.document(req);

              await projectService.saveProjects(projectDocument, duplicateProjectDocument);

              const res = await requestUpdateProject(getProjectId(projectDocument), projectDataFactory.request({
                name: duplicateProjectDocument.name,
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveMessage('Duplicate project name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                description: <any>1,
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string'); 
            });

            test('is too short', async ({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                description: '',
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if projectId', () => {
            test('is not mongo id', async ({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id('not-mongo-id'), req);
              
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHavePatternValidationError('pathParameters', 'projectId');
            });
            
            test('does not belong to any project', async ({ requestUpdateProject }) => {
              const res = await requestUpdateProject(projectDataFactory.id(), req);
              
              apiExpect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  }
});
