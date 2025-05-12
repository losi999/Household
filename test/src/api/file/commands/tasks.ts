import { File } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';

const getFileDocumentById = (...params: Parameters<IFileService['getFileById']>) => {
  return cy.task<File.Document>('getFileById', params);
};

const saveFileDocument = (...params: Parameters<IFileService['saveFile']>) => {
  return cy.task<File.Document>('saveFile', params);
};

const writeFileToS3 = (...params: Parameters<IStorageService['writeFile']>) => {
  return cy.task<unknown>('writeFile', params);
};

const chechFileInS3 = (...params: Parameters<IStorageService['checkFile']>) => {
  return cy.task<unknown>('checkFile', params, {});
};

const deleteFileFromS3 = (...params: Parameters<IStorageService['deleteFile']>) => {
  return cy.task<unknown>('deleteFile', params);
};

export const setFileTaskCommands = () => {
  Cypress.Commands.addAll({
    getFileDocumentById,
    saveFileDocument,
    chechFileInS3,
    deleteFileFromS3,
    writeFileToS3,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      getFileDocumentById: CommandFunction<typeof getFileDocumentById>;
      saveFileDocument: CommandFunction<typeof saveFileDocument>;
      chechFileInS3: CommandFunction<typeof chechFileInS3>;
      deleteFileFromS3: CommandFunction<typeof deleteFileFromS3>;
      writeFileToS3: CommandFunction<typeof writeFileToS3>;
    }
  }
}
