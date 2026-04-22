import { getRecipientId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Recipient } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';

type RecipientApiFixture = {
  requestGetRecipient(recipientId: Recipient.Id): Promise<APIResponse>;
  requestListRecipients(): Promise<APIResponse>;
  requestCreateRecipient(recipient: Recipient.Request): Promise<APIResponse>;
  requestUpdateRecipient(recipientId: Recipient.Id, recipient: Recipient.Request): Promise<APIResponse>;
  requestDeleteRecipient(recipientId: Recipient.Id): Promise<APIResponse>;
  requestMergeRecipients(recipientId: Recipient.Id, sourceRecipientIds: Recipient.Id[]): Promise<APIResponse>;
};

export const validateRecipientResponse = (response: Recipient.Response, document: Recipient.Document) => {
  return new Comparer(response, {
    recipientId: getRecipientId(document),
    name: document?.name,
  });
};

export const test = baseTest.extend<RecipientApiFixture>({
  requestGetRecipient: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetRecipient = async (recipientId: Recipient.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetRecipient);
  },
  requestListRecipients: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListRecipients = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/recipient/v1/recipients`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListRecipients);
  },
  requestCreateRecipient: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateRecipient = async (recipient: Recipient.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/recipient/v1/recipients`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: recipient,
      });
    };

    await use(requestCreateRecipient);
  },
  requestUpdateRecipient: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateRecipient = async (recipientId: Recipient.Id, recipient: Recipient.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: recipient,
      });
    };

    await use(requestUpdateRecipient);
  },
  requestDeleteRecipient: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteRecipient = async (recipientId: Recipient.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteRecipient);
  },
  requestMergeRecipients: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeRecipients = async (recipientId: Recipient.Id, sourceRecipientIds: Recipient.Id[]) => {
      return loggedRequest.post(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}/merge`, {
        headers: {
          Authorization: authToken,
        },
        data: sourceRecipientIds,
      });
    };

    await use(requestMergeRecipients);
  },
});

export const expect = baseExpect.extend({
  async toHaveBeenSavedAsRecipientDocument(req: Recipient.Request, document: Recipient.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected recipient to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      name: req.name,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected recipient to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Recipient.Document) {
    return {
      pass: !document,
      message: () => `Expected recipient to be deleted from database, but it was found with id ${getRecipientId(document)}`,
    };
  },
  async toMatchRecipientDocument(received: APIResponse, document: Recipient.Document) {
    const response = await received.json() as Recipient.Response;

    const errors = validateRecipientResponse(response, document).validate();

    return {
      pass: !errors.length,
      message: () => `Expected response to match recipient document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingRecipientDocument(received: APIResponse, document: Recipient.Document) {
    const response = await received.json() as Recipient.Response[];

    const matchingResponse = response.find(r => r.recipientId === getRecipientId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a recipient with id ${getRecipientId(document)}, but it was not found`,
      };
    }

    const errors = validateRecipientResponse(matchingResponse, document).validate();

    return {
      pass: !errors.length,
      message: () => `Expected response to match recipient document, but it did not:\n${errors.join('\n')}`,
    };
  },
});
