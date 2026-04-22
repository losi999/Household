import { entries } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { test as recipientApiTest, expect as recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { default as schema } from '@household/test/schemas/recipient-response-list';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { test as recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { mergeTests } from '@playwright/test';

const permissionMap = forbidUsers();

const test = mergeTests(recipientApiTest, recipientDbTest);

test.describe('GET /recipient/v1/recipients', () => {
  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestListRecipients }) => {
      const res = await requestListRecipients();
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
        test('should return forbidden', async ({ requestListRecipients }) => {
          const res = await requestListRecipients();
          apiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of recipients', async ({ requestListRecipients, saveRecipients }) => {
          const recipientDocument1 = recipientDataFactory.document();
          const recipientDocument2 = recipientDataFactory.document();

          await saveRecipients(recipientDocument1, recipientDocument2);

          const res = await requestListRecipients();
          apiExpect(res).toBeOkResponse();
          apiExpect(res).toMatchSchema(schema);
          recipientApiExpect(res).toContainMatchingRecipientDocument(recipientDocument1);
          recipientApiExpect(res).toContainMatchingRecipientDocument(recipientDocument2);
        });
      }
    });
  }
});
