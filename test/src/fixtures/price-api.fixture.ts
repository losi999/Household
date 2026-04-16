import { headerExpiresIn } from '@household/shared/constants';
import { Price } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
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

export const expect = baseExpect.extend({});
