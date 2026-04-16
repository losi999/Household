import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { Project } from '@household/shared/types/types';
import { mergeExpects } from '@playwright/test';
import { projectService } from '@household/test/dependencies';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(projectApiExpect, apiExpect);

test.describe('POST /project/v1/projects', () => {
  let req: Project.Request;

  test.beforeEach(() => {
    req = projectDataFactory.request();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestCreateProject }) => {
      const res = await requestCreateProject(req);
      expect(res).toBeUnauthorizedResponse();
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
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create project', () => {
          test('with complete body', async ({ requestCreateProject }) => {
            const res = await requestCreateProject(req);
            expect(res).toBeCreatedResponse();

            const { projectId } = (await res.json()) as Project.ProjectId;
            expect(req).toBeStoredInDatabase(await projectService.findProjectById(projectId));
          });

          test.describe('without optional property in body', () => {
            test('description', async ({ requestCreateProject }) => {
              req = projectDataFactory.request({
                description: undefined,
              });

              const res = await requestCreateProject(req);
              expect(res).toBeCreatedResponse();
              
              const { projectId } = (await res.json()) as Project.ProjectId;
              expect(req).toBeStoredInDatabase(await projectService.findProjectById(projectId));
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
  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                name: undefined,
              }));

              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });
            
            test('is not string', async({ requestCreateProject }) => {
              
              const res = await requestCreateProject(projectDataFactory.request({
                name: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                name: '',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different project', async ({ requestCreateProject }) => {
              const projectDocument = projectDataFactory.document(req);

              await projectService.saveProject(projectDocument);

              const res = await requestCreateProject(req);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate project name');
            });
          });

          test.describe('if description', () => {
            test('is not string', async({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                description: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string'); 
            });

            test('is too short', async ({ requestCreateProject }) => {
              const res = await requestCreateProject(projectDataFactory.request({
                description: '',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });
        });
      }
    });
  }
});
