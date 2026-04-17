import { getPriceId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Price } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { createComparer } from '@household/test/utils';
import { APIResponse } from '@playwright/test';

type PriceApiFixture = {
  requestCreatePrice(price: Price.Request): Promise<APIResponse>;
  requestUpdatePrice(priceId: Price.Id, price: Price.Request): Promise<APIResponse>;
  requestDeletePrice(priceId: Price.Id): Promise<APIResponse>;
  requestListPrices(): Promise<APIResponse>;
};

export const test = baseTest.extend<PriceApiFixture>({
  requestCreatePrice: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreatePrice = async (price: Price.Request) => {
      return request.post(`${process.env.BASE_URL}/price/v1/prices`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: price,
      });
    };

    await use(requestCreatePrice);
  },
  requestUpdatePrice: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdatePrice = async (priceId: Price.Id, price: Price.Request) => {
      return request.put(`${process.env.BASE_URL}/price/v1/prices/${priceId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: price,
      });
    };

    await use(requestUpdatePrice);
  },
  requestDeletePrice: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeletePrice = async (priceId: Price.Id) => {
      return request.delete(`${process.env.BASE_URL}/price/v1/prices/${priceId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeletePrice);
  },
  requestListPrices: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListPrices = async () => {
      return request.get(`${process.env.BASE_URL}/price/v1/prices`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListPrices);
  },
});

export const expect = baseExpect.extend({
  async toBeStoredInDatabase(req: Price.Request, document: Price.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected price to be stored in database, but it was not found',
      };
    }
  
    const comparer = createComparer((compare) => {
      return {
        name: compare(document.name, req.name),
        amount: compare(document.amount, req.amount),
        isArchived: compare(document.isArchived, false),
        unitOfMeasurement: compare(document.unitOfMeasurement, req.unitOfMeasurement),
      };  
    });
  
    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Price.Document) {
    return {
      pass: !document,
      message: () => `expected price to be deleted from database, but it was found with id ${getPriceId(document)}`,
    };
  },
  toHaveBeenArchivedInDatabase(originalDocument: Price.Document, currentDocument: Price.Document) {
    const comparer = createComparer((compare) => {
      return {
        name: compare(currentDocument.name, originalDocument.name),
        amount: compare(currentDocument.amount, originalDocument.amount),
        isArchived: compare(currentDocument.isArchived, true),
        unitOfMeasurement: compare(currentDocument.unitOfMeasurement, originalDocument.unitOfMeasurement),
      };  
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchPriceDocumentInList(received: APIResponse, document: Price.Document) {
    const response = await received.json() as Price.Response[];
  
    const matchingResponse = response.find(r => r.priceId === getPriceId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a price with id ${getPriceId(document)}, but it was not found`,
      };
    }

    const comparer = createComparer((compare) => {
      return {
        priceId: compare(matchingResponse.priceId, getPriceId(document)),
        name: compare(matchingResponse.name, document.name),
        amount: compare(matchingResponse.amount, document.amount),
        unitOfMeasurement: compare(matchingResponse.unitOfMeasurement, document.unitOfMeasurement),
      };  
    });
  
    const message = comparer.validate(matchingResponse);
  
    return {
      pass: !message,
      message: () => message,
    };
  }, 
  async toNotMatchPriceDocumentInList(received: APIResponse, document: Price.Document) {
    const response = await received.json() as Price.Response[];
  
    const matchingResponse = response.find(r => r.priceId === getPriceId(document));
  
    return {
      pass: !matchingResponse,
      message: () => `expected response not to contain a price with id ${getPriceId(document)}, but it was found`,
    };
  }, 
});
