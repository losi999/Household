import { entries } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { test as projectApiTest, expect as projectApiExpect } from '@household/test/fixtures/project-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { default as schema } from '@household/test/schemas/project-response-list';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { test as projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { mergeTests } from '@playwright/test';

const permissionMap = forbidUsers();

const test = mergeTests(projectApiTest, projectDbTest);

test.describe('GET /project/v1/projects', () => {
  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestListProjects }) => {
      const res = await requestListProjects();
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
        test('should return forbidden', async ({ requestListProjects }) => {
          const res = await requestListProjects();
          apiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of projects', async ({ requestListProjects, saveProjects }) => {
          const projectDocument1 = projectDataFactory.document();
          const projectDocument2 = projectDataFactory.document();

          await saveProjects(projectDocument1, projectDocument2);

          const res = await requestListProjects();
          apiExpect(res).toBeOkResponse();
          apiExpect(res).toMatchSchema(schema); 
          projectApiExpect(res).toContainMatchingProjectDocument(projectDocument1);
          projectApiExpect(res).toContainMatchingProjectDocument(projectDocument2);
        });
      }
    });
  }
});
