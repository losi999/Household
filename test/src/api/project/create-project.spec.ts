import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { projectApiTest, projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { mergeTests } from '@playwright/test';
import { projectDbTest } from '@household/test/fixtures/project-db.fixture';

const permissionMap = allowUsers('editor');

const test = mergeTests(projectApiTest, projectDbTest);

test.describe('POST /project/v1/projects', () => {
  let req: Requests.Project;

  test.beforeEach(async () => {
    req = projectDataFactory.request();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestCreateProject }) => {
      const res = await requestCreateProject(req);
      projectApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestCreateProject }) => {
          const res = await requestCreateProject(req);
          projectApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create project', () => {
          test('with complete body', async ({ requestCreateProject, findProjectById }) => {
            const res = await requestCreateProject(req);
            projectApiExpect(res).toBeCreatedResponse();

            const { projectId } = (await res.json()) as Api.Project.ProjectId;
            projectApiExpect(req).toHaveBeenSavedAsProjectDocument(await findProjectById(projectId));
          });

          test.describe('without optional property in body', () => {
            test('description', async ({ requestCreateProject, findProjectById }) => {
              req = projectDataFactory.request({
                description: undefined,
              });

              const res = await requestCreateProject(req);
              projectApiExpect(res).toBeCreatedResponse();
              
              const { projectId } = (await res.json()) as Api.Project.ProjectId;
              projectApiExpect(req).toHaveBeenSavedAsProjectDocument(await findProjectById(projectId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateProject }) => {
              const res = await requestCreateProject({
                ...req,
                extraProperty: 'extra',
              } as any);
  
              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                name: undefined,
              }));

              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });
            
            test('is not string', async({ requestCreateProject }) => {
              
              const res = await requestCreateProject(projectDataFactory.request({
                name: <any>1,
              }));
              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                name: '',
              }));
              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different project', async ({ requestCreateProject, saveProject }) => {
              const projectDocument = projectDataFactory.document(req);

              await saveProject(projectDocument);

              const res = await requestCreateProject(req);
              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveMessage('Duplicate project name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                description: <any>1,
              }));
              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveWrongTypeValidationError('body', 'description', 'string'); 
            });

            test('is too short', async ({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                description: '',
              }));
              projectApiExpect(res).toBeBadRequestResponse();
              projectApiExpect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });
        });
      }
    });
  }
});
