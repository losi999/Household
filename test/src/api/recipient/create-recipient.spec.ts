import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { Recipient } from '@household/shared/types/types';
import { mergeExpects } from '@playwright/test';
import { recipientService } from '@household/test/dependencies';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(recipientApiExpect, apiExpect);

test.describe('POST /recipient/v1/recipients', () => {
  let req: Recipient.Request;

  test.beforeEach(() => {
    req = recipientDataFactory.request();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestCreateRecipient }) => {
      const res = await requestCreateRecipient(req);
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
        test('should return forbidden', async ({ requestCreateRecipient }) => {
          const res = await requestCreateRecipient(req);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create recipient', async ({ requestCreateRecipient }) => {
          const res = await requestCreateRecipient(req);
          expect(res).toBeCreatedResponse();

          const { recipientId } = (await res.json()) as Recipient.RecipientId;
          expect(req).toBeStoredInDatabase(await recipientService.findRecipientById(recipientId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient({
                ...req,
                extraProperty: 'extra',
              } as any);
            
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient(recipientDataFactory.request({
                name: undefined,
              }));

              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient(recipientDataFactory.request({
                name: <any>1,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateRecipient }) => {
              const res = await requestCreateRecipient(recipientDataFactory.request({
                name: '',
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different recipient', async ({ requestCreateRecipient }) => {
              const recipientDocument = recipientDataFactory.document(req);

              await recipientService.saveRecipient(recipientDocument);

              const res = await requestCreateRecipient(req);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate recipient name');
            });
          });
        });
      }
    });
  }
});
