import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getPriceId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface IPriceDocumentConverter {
  create(body: Requests.Price, expiresIn: number, generateId?: boolean): Documents.Price;
  update(body: Requests.Price, expiresIn: number): DocumentUpdate<Documents.Price>;
  toResponse(doc: Documents.Price): Responses.Price;
  toResponseList(docs: Documents.Price[]): Responses.Price[];
}

export const priceDocumentConverterFactory = (): IPriceDocumentConverter => {
  const instance: IPriceDocumentConverter = {
    create: ({ name, amount, unitOfMeasurement }, expiresIn, generateId) => {
      return {
        amount,
        name,
        unitOfMeasurement,
        isArchived: false,
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
    toResponse: ({ amount, _id, name, unitOfMeasurement }) => {
      return {
        name,
        amount,
        unitOfMeasurement,
        priceId: getPriceId(_id),
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
