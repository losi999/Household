import { getRecipientId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Recipient } from '@household/shared/types/types';
import { createComparer } from '@household/test/utils';
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

const validateRecipientResponse = (response: Recipient.Response, document: Recipient.Document): string => {
  const comparer = createComparer((compare) => {
    return {
      recipientId: compare(response.recipientId, getRecipientId(document)),
      name: compare(response.name, document.name),
    };
  });

  const extraKeys = comparer.extraKeys(response);

  if (extraKeys.length > 0) {
    return `expected response to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`;
  }

  const notMatchingProperties = comparer.notMatchingProperties();

  if (notMatchingProperties.length > 0) {
    return `expected response to match recipient document, but the following properties did not match: ${notMatchingProperties.join(', ')}`;
  }
};

export const test = baseTest.extend<RecipientApiFixture>({
  requestGetRecipient: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetRecipient = async (recipientId: Recipient.Id) => {
      return request.get(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetRecipient);
  },
  requestListRecipients: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListRecipients = async () => {
      return request.get(`${process.env.BASE_URL}/recipient/v1/recipients`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListRecipients);
  },
  requestCreateRecipient: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateRecipient = async (recipient: Recipient.Request) => {
      return request.post(`${process.env.BASE_URL}/recipient/v1/recipients`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: recipient,
      });
    };

    await use(requestCreateRecipient);
  },
  requestUpdateRecipient: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateRecipient = async (recipientId: Recipient.Id, recipient: Recipient.Request) => {
      return request.put(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: recipient,
      });
    };

    await use(requestUpdateRecipient);
  },
  requestDeleteRecipient: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteRecipient = async (recipientId: Recipient.Id) => {
      return request.delete(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteRecipient);
  },
  requestMergeRecipients: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeRecipients = async (recipientId: Recipient.Id, sourceRecipientIds: Recipient.Id[]) => {
      return request.post(`${process.env.BASE_URL}/recipient/v1/recipients/${recipientId}/merge`, {
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
  toHaveBeenDeletedFromDatabase(document: Recipient.Document) {
    return {
      pass: !document,
      message: () => `expected recipient to be deleted from database, but it was found with id ${getRecipientId(document)}`,
    };
  },
  async toMatchRecipientDocument(received: APIResponse, document: Recipient.Document) {
    const response = await received.json() as Recipient.Response;

    const message = validateRecipientResponse(response, document);

    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchRecipientDocumentInList(received: APIResponse, document: Recipient.Document) {
    const response = await received.json() as Recipient.Response[];

    const matchingResponse = response.find(r => r.recipientId === getRecipientId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a recipient with id ${getRecipientId(document)}, but it was not found`,
      };
    }

    const message = validateRecipientResponse(matchingResponse, document);

    return {
      pass: !message,
      message: () => message,
    };
  },
  async toBeStoredInDatabase(req: Recipient.Request, document: Recipient.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected recipient to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        name: compare(document.name, req.name),
      };
    });

    const extraKeys = comparer.extraKeys(document, [
      '_id',
      'createdAt',
      'expiresAt',
      'updatedAt',
    ]);

    if (extraKeys.length > 0) {
      return {
        pass: false,
        message: () => `expected recipient in database to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`,
      };
    }

    const notMatchingProperties = comparer.notMatchingProperties();

    if (notMatchingProperties.length > 0) {
      return {
        pass: false,
        message: () => `expected recipient in database to match request, but the following properties did not match: ${notMatchingProperties.join(', ')}`,
      };
    }

    return {
      pass: true,
      message: () => '',
    };
  },
});
