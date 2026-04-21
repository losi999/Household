import { getPriceId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Price } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { Comparer } from '@household/test/comparer';
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
  async toHaveBeenSavedAsPriceDocument(req: Price.Request, document: Price.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected price to be stored in database, but it was not found',
      };
    }
  
    const comparer = new Comparer(document, {
      name: req.name,
      amount: req.amount,
      isArchived: false,
      unitOfMeasurement: req.unitOfMeasurement,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected price to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Price.Document) {
    return {
      pass: !document,
      message: () => `Expected price to be deleted from database, but it was found with id ${getPriceId(document)}`,
    };
  },
  toHaveBeenArchivedInDatabase(originalDocument: Price.Document, currentDocument: Price.Document) {
    const comparer = new Comparer(currentDocument, {
      name: originalDocument.name,
      amount: originalDocument.amount,
      isArchived: true,
      unitOfMeasurement: originalDocument.unitOfMeasurement,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected price to be archived in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingPriceDocument(received: APIResponse, document: Price.Document) {
    const response = await received.json() as Price.Response[];
  
    const matchingResponse = response.find(r => r.priceId === getPriceId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a price with id ${getPriceId(document)}, but it was not found`,
      };
    }

    const comparer = new Comparer(matchingResponse, {
      priceId: getPriceId(document),
      name: document.name,
      amount: document.amount,
      unitOfMeasurement: document.unitOfMeasurement,
    });
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match price document, but it did not:\n${errors.join('\n')}`,
    };
  }, 
  async toNotContainMatchingPriceDocument(received: APIResponse, document: Price.Document) {
    const response = await received.json() as Price.Response[];
  
    const matchingResponse = response.find(r => r.priceId === getPriceId(document));
  
    return {
      pass: !matchingResponse,
      message: () => `Expected response not to contain a price with id ${getPriceId(document)}, but it was found`,
    };
  }, 
});
