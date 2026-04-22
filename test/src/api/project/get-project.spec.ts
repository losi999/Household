import { entries, getProjectId } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { test as projectApiTest, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { default as schema } from '@household/test/schemas/project-response';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { test as projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { mergeTests } from '@playwright/test';

const permissionMap = forbidUsers();

const test = mergeTests(projectApiTest, projectDbTest);

test.describe('GET /project/v1/projects/{projectId}', () => {
  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestGetProject }) => {
      const res = await requestGetProject(projectDataFactory.id());
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
        test('should return forbidden', async ({ requestGetProject }) => {
          const res = await requestGetProject(projectDataFactory.id());
          apiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get project by id', async ({ requestGetProject, saveProject }) => {
          const projectDocument = projectDataFactory.document();

          await saveProject(projectDocument);

          const res = await requestGetProject(getProjectId(projectDocument));
          apiExpect(res).toBeOkResponse();
          apiExpect(res).toMatchSchema(schema);
          projectApiExpect(res).toMatchProjectDocument(projectDocument);
        });

        test.describe('should return error', () => {
          test.describe('if projectId', () => {
            test('is not mongo id', async ({ requestGetProject }) => {
              const res = await requestGetProject(projectDataFactory.id('not-mongo-id'));
              
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHavePatternValidationError('pathParameters', 'projectId');
            });
            
            test('does not belong to any project', async ({ requestGetProject }) => {
              const res = await requestGetProject(projectDataFactory.id());
              
              apiExpect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  }
});
