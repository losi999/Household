import { entries, getRecipientId } from '@household/shared/common/utils';
import { forbidUsers } from '@household/test/utils';
import { test as recipientApiTest, expect as recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { default as schema } from '@household/test/schemas/recipient-response';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { test as recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { mergeTests } from '@playwright/test';

const permissionMap = forbidUsers();

const test = mergeTests(recipientApiTest, recipientDbTest);

test.describe('GET /recipient/v1/recipients/{recipientId}', () => {
  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestGetRecipient }) => {
      const res = await requestGetRecipient(recipientDataFactory.id());
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
        test('should return forbidden', async ({ requestGetRecipient }) => {
          const res = await requestGetRecipient(recipientDataFactory.id());
          apiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get recipient by id', async ({ requestGetRecipient, saveRecipient }) => {
          const recipientDocument = recipientDataFactory.document();

          await saveRecipient(recipientDocument);

          const res = await requestGetRecipient(getRecipientId(recipientDocument));
          apiExpect(res).toBeOkResponse();
          apiExpect(res).toMatchSchema(schema);
          recipientApiExpect(res).toMatchRecipientDocument(recipientDocument);
        });

        test.describe('should return error', () => {
          test.describe('if recipientId', () => {
            test('is not mongo id', async ({ requestGetRecipient }) => {
              const res = await requestGetRecipient(recipientDataFactory.id('not-mongo-id'));

              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHavePatternValidationError('pathParameters', 'recipientId');
            });

            test('does not belong to any recipient', async ({ requestGetRecipient }) => {
              const res = await requestGetRecipient(recipientDataFactory.id());

              apiExpect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  }
});
