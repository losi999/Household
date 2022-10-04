export const isLocalhost = () => {
  return Cypress.env('ENV') === 'localhost';
};
