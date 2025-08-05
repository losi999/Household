import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getCustomerId } from '@household/shared/common/utils';
import { Customer } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ICustomerDocumentConverter {
  create(body: Customer.Request, expiresIn: number, generateId?: boolean): Customer.Document;
  update(body: Customer.Request, expiresIn: number): UpdateQuery<Customer.Document>;
  toResponse(doc: Customer.Document): Customer.Response;
  toResponseList(docs: Customer.Document[]): Customer.Response[];
}

export const customerDocumentConverterFactory = (): ICustomerDocumentConverter => {
  const instance: ICustomerDocumentConverter = {
    create: ({ name }, expiresIn, generateId) => {
      return {
        name,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      return {
        $set: {
          ...body,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };
    },
    toResponse: ({ name, _id }) => {
      return {
        name,
        customerId: getCustomerId(_id),
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
