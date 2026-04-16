import { entries } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { test, expect as recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { default as schema } from '@household/test/schemas/recipient-response-list';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { recipientService } from '@household/test/dependencies';

const permissionMap = forbidUsers();

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
        test('should get a list of recipients', async ({ requestListRecipients }) => {
          const recipientDocument1 = recipientDataFactory.document();
          const recipientDocument2 = recipientDataFactory.document();

          await recipientService.saveRecipients(recipientDocument1, recipientDocument2);

          const res = await requestListRecipients();
          apiExpect(res).toBeOkResponse();
          apiExpect(res).toMatchSchema(schema);
          recipientApiExpect(res).toMatchRecipientDocumentInList(recipientDocument1);
          recipientApiExpect(res).toMatchRecipientDocumentInList(recipientDocument2);
        });
      }
    });
  }
});
