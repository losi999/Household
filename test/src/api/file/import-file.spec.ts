import { File, Import } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { getFileId } from '@household/shared/common/utils';
import { FileType } from '@household/shared/enums';

describe('Import file', () => {
  let revolutFileDocument: File.Document;
  let otpFileDocument: File.Document;
  let ersteFileDocument: File.Document;
  let revolutRow: Import.Revolut;
  let otpRow: Import.Otp;
  let ersteRow: Import.Erste;

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

    revolutRow = fileDataFactory.revolut.row();
    ersteRow = fileDataFactory.erste.row();
    otpRow = fileDataFactory.otp.row();

    cy.saveFileDocument(revolutFileDocument)
      .saveFileDocument(otpFileDocument)
      .saveFileDocument(ersteFileDocument)
      .uploadFileToS3(getFileId(revolutFileDocument), fileDataFactory.revolut.file(revolutFileDocument.timezone, [revolutRow]))
      .uploadFileToS3(getFileId(otpFileDocument), fileDataFactory.otp.file(otpFileDocument.timezone, [otpRow]))
      .uploadFileToS3(getFileId(ersteFileDocument), fileDataFactory.erste.file(ersteFileDocument.timezone, [ersteRow]))
      .wait(5000);
  });

  after(() => {
    cy.deleteFileFromS3(getFileId(revolutFileDocument))
      .deleteFileFromS3(getFileId(otpFileDocument))
      .deleteFileFromS3(getFileId(ersteFileDocument));
  });

  it('should trigger importing of revolut file', () => {
    cy.validateFileDocumentProcessed(revolutFileDocument)
      .validateImportedRevolutDraftDocuments(getFileId(revolutFileDocument), revolutRow);
  });

  it('should trigger importing of import otp file', () => {
    cy.validateFileDocumentProcessed(otpFileDocument)
      .validateImportedOtpDraftDocuments(getFileId(otpFileDocument), otpRow);
  });

  it('should trigger importing of import erste file', () => {
    cy.validateFileDocumentProcessed(ersteFileDocument)
      .validateImportedErsteDraftDocuments(getFileId(ersteFileDocument), ersteRow);
  });
});
