import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { recipientApiTest, recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { mergeTests } from '@playwright/test';
import { recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';

const permissionMap = allowUsers('editor');

const test = mergeTests(recipientApiTest, recipientDbTest);

test.describe('POST /recipient/v1/recipients', () => {
  let req: Requests.Recipient;

  test.beforeEach(async () => {
    req = recipientDataFactory.request();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestCreateRecipient }) => {
      const res = await requestCreateRecipient(req);
      recipientApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestCreateRecipient }) => {
          const res = await requestCreateRecipient(req);
          recipientApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create recipient', async ({ requestCreateRecipient, findRecipientById }) => {
          const res = await requestCreateRecipient(req);
          recipientApiExpect(res).toBeCreatedResponse();

          const { recipientId } = (await res.json()) as Api.Recipient.RecipientId;
          recipientApiExpect(req).toHaveBeenSavedAsRecipientDocument(await findRecipientById(recipientId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient({
                ...req,
                extraProperty: 'extra',
              } as any);
            
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient(recipientDataFactory.request({
                name: undefined,
              }));

              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient(recipientDataFactory.request({
                name: <any>1,
              }));
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient(recipientDataFactory.request({
                name: '',
              }));
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different recipient', async ({ requestCreateRecipient, saveRecipient }) => {
              const recipientDocument = recipientDataFactory.document(req);

              await saveRecipient(recipientDocument);

              const res = await requestCreateRecipient(req);
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveMessage('Duplicate recipient name');
            });
          });
        });
      }
    });
  }
});
