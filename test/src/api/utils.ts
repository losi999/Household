import { faker } from '@faker-js/faker';

export const isLocalhost = () => {
  return Cypress.env('ENV') === 'localhost';
};

export const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;
