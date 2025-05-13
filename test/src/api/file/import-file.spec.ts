import { File, Import } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { getFileId } from '@household/shared/common/utils';
import { FileType } from '@household/shared/enums';

describe('Import file', () => {
  let revolutFileDocument: File.Document;
  let otpFileDocument: File.Document;
  let ersteFileDocument: File.Document;
  let revolutRows: Import.Revolut[];
  let otpRows: Import.Otp[];
  let ersteRows: Import.Erste[];

  before('uploading file to import bucket', () => {
    revolutFileDocument = fileDataFactory.document({
      fileType: FileType.Revolut,
    });

    otpFileDocument = fileDataFactory.document({
      fileType: FileType.Otp,
    });

    ersteFileDocument = fileDataFactory.document({
      fileType: FileType.Erste,
    });

    const revolutFile = fileDataFactory.revolutFile();
    const otpFile = fileDataFactory.otpFile();
    const ersteFile = fileDataFactory.ersteFile();

    revolutRows = revolutFile.rows;
    otpRows = otpFile.rows;
    ersteRows = ersteFile.rows;

    cy.saveFileDocument(revolutFileDocument)
      .saveFileDocument(otpFileDocument)
      .saveFileDocument(ersteFileDocument)
      .uploadFileToS3(getFileId(revolutFileDocument), revolutFile.file)
      .uploadFileToS3(getFileId(otpFileDocument), otpFile.file)
      .uploadFileToS3(getFileId(ersteFileDocument), ersteFile.file)
      .wait(5000);
  });

  after(() => {
    // cy.deleteFileFromS3(getFileId(revolutFileDocument))
    //   .deleteFileFromS3(getFileId(otpFileDocument))
    //   .deleteFileFromS3(getFileId(ersteFileDocument));
  });

  it.only('should trigger importing of revolut file', () => {
    cy.validateFileDocumentProcessed(revolutFileDocument)
      .validateImportedRevolutDraftDocuments(getFileId(revolutFileDocument), ...revolutRows);
  });

  it('should trigger importing of import otp file', () => {
    cy.validateFileDocumentProcessed(otpFileDocument)
      .validateImportedOtpDraftDocuments(getFileId(otpFileDocument), ...otpRows);
  });

  it('should trigger importing of import erste file', () => {
    cy.validateFileDocumentProcessed(ersteFileDocument)
      .validateImportedErsteDraftDocuments(getFileId(ersteFileDocument), ...ersteRows);
  });
});
