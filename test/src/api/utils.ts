import { faker } from '@faker-js/faker';

export const isLocalhost = () => {
  return Cypress.env('ENV') === 'localhost';
};

export const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;

export const expectRemainingProperties = (internal: object) => {
  Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf([
    '_id',
    'createdAt',
    'expiresAt',
    'updatedAt',
  ]));
};

export const expectEmptyObject = (obj: object) => {
  expect(obj).to.deep.equal({});
};
