import { entries, getRecipientId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { Recipient } from '@household/shared/types/types';
import { recipientService } from '@household/test/dependencies';

const permissionMap = allowUsers('editor');

test.describe('PUT /recipient/v1/recipients/{recipientId}', () => {
  let req: Recipient.Request;
  let recipientDocument: Recipient.Document;

  test.beforeEach(async () => {
    req = recipientDataFactory.request();

    recipientDocument = recipientDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestUpdateRecipient }) => {
      const res = await requestUpdateRecipient(recipientDataFactory.id(), req);
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
        test('should return forbidden', async ({ requestUpdateRecipient }) => {
          const res = await requestUpdateRecipient(recipientDataFactory.id(), req);
          apiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should update a recipient', async ({ requestUpdateRecipient }) => {
          await recipientService.saveRecipient(recipientDocument);

          const res = await requestUpdateRecipient(getRecipientId(recipientDocument), req);
          apiExpect(res).toBeCreatedResponse();

          const { recipientId } = (await res.json()) as Recipient.RecipientId;
          recipientApiExpect(req).toBeStoredInDatabase(await recipientService.findRecipientById(recipientId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateRecipient }) => {
              const res = await requestUpdateRecipient(recipientDataFactory.id(), {
                ...req,
                extraProperty: 'extra',
              } as any);

              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestUpdateRecipient }) => {
              const res = await requestUpdateRecipient(recipientDataFactory.id(), recipientDataFactory.request({
                name: undefined,
              }));

              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestUpdateRecipient }) => {
              const res = await requestUpdateRecipient(recipientDataFactory.id(), recipientDataFactory.request({
                name: <any>1,
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestUpdateRecipient }) => {
              const res = await requestUpdateRecipient(recipientDataFactory.id(), recipientDataFactory.request({
                name: '',
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different recipient', async ({ requestUpdateRecipient }) => {
              const duplicateRecipientDocument = recipientDataFactory.document(req);

              await recipientService.saveRecipients(recipientDocument, duplicateRecipientDocument);

              const res = await requestUpdateRecipient(getRecipientId(recipientDocument), recipientDataFactory.request({
                name: duplicateRecipientDocument.name,
              }));
              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHaveMessage('Duplicate recipient name');
            });
          });

          test.describe('if recipientId', () => {
            test('is not mongo id', async ({ requestUpdateRecipient }) => {
              const res = await requestUpdateRecipient(recipientDataFactory.id('not-mongo-id'), req);

              apiExpect(res).toBeBadRequestResponse();
              apiExpect(res).toHavePatternValidationError('pathParameters', 'recipientId');
            });

            test('does not belong to any recipient', async ({ requestUpdateRecipient }) => {
              const res = await requestUpdateRecipient(recipientDataFactory.id(), req);

              apiExpect(res).toBeNotFoundResponse();
            });
          });
        });
      }
    });
  }
});
