import { Price } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IPriceService } from '@household/shared/services/price-service';

const savePriceDocument = (...params: Parameters<IPriceService['savePrice']>) => {
  return cy.task<Price.Document>('savePrice', params);
};

const savePriceDocuments = (...params: Parameters<IPriceService['savePrices']>) => {
  return cy.task<Price.Document>('savePrices', params);
};

const findPriceDocumentById = (...params: Parameters<IPriceService['findPriceById']>) => {
  return cy.task<Price.Document>('findPriceById', params);
};

export const setPriceTaskCommands = () => {
  Cypress.Commands.addAll({
    savePriceDocument,
    savePriceDocuments,
    findPriceDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      savePriceDocument: CommandFunction<typeof savePriceDocument>;
      savePriceDocuments: CommandFunction<typeof savePriceDocuments>;
      findPriceDocumentById: CommandFunction<typeof findPriceDocumentById>
    }
  }
}
