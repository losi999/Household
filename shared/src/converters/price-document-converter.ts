import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getPriceId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';

export interface IPriceDocumentConverter {
  create(body: Price.Request, expiresIn: number, generateId?: boolean): Price.Document;
  update(body: Price.Request, expiresIn: number): DocumentUpdate<Price.Document>;
  toResponse(doc: Price.Document): Price.Response;
  toResponseList(docs: Price.Document[]): Price.Response[];
}

export const priceDocumentConverterFactory = (): IPriceDocumentConverter => {
  const instance: IPriceDocumentConverter = {
    create: ({ name, amount }, expiresIn, generateId) => {
      return {
        amount,
        name,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      return {
        update: {
          $set: {
            ...body,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
        },
      };
    },
    toResponse: ({ amount, _id, name }) => {
      return {
        name,
        amount,
        priceId: getPriceId(_id),
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
