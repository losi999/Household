import { File } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';

const findFileDocumentById = (...params: Parameters<IFileService['findFileById']>) => {
  return cy.task<File.Document>('findFileById', params);
};

const saveFileDocument = (...params: Parameters<IFileService['saveFile']>) => {
  return cy.task<File.Document>('saveFile', params);
};

const uploadFileToS3 = (...params: Parameters<IStorageService['uploadFile']>) => {
  return cy.task<unknown>('uploadFile', params);
};

const writeFileToS3 = (...params: Parameters<IStorageService['writeFile']>) => {
  return cy.task<unknown>('writeFile', params);
};

const chechFileInS3 = (...params: Parameters<IStorageService['checkFile']>) => {
  return cy.task<unknown>('checkFile', params, {});
};

export const setFileTaskCommands = () => {
  Cypress.Commands.addAll({
    findFileDocumentById,
    saveFileDocument,
    chechFileInS3,
    writeFileToS3,
    uploadFileToS3,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      findFileDocumentById: CommandFunction<typeof findFileDocumentById>;
      saveFileDocument: CommandFunction<typeof saveFileDocument>;
      chechFileInS3: CommandFunction<typeof chechFileInS3>;
      writeFileToS3: CommandFunction<typeof writeFileToS3>;
      uploadFileToS3: CommandFunction<typeof uploadFileToS3>;
    }
  }
}
