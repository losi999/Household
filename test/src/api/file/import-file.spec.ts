import { File, Import } from '@household/shared/types/types';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { getFileId } from '@household/shared/common/utils';
import { FileProcessingStatus, FileType } from '@household/shared/enums';
import { test, expect as domainExpect } from '@household/test/fixtures/file-api.fixture';
import { expect as transactionExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { fileService, storageService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(domainExpect, apiExpect, transactionExpect);

test.describe('Import file', () => {
  let revolutFileDocument: File.Document;
  let otpFileDocument: File.Document;
  let ersteFileDocument: File.Document;
  let revolutRow: Import.Revolut;
  let otpRow: Import.Otp;
  let ersteRow: Import.Erste;

  test.beforeAll('uploading file to import bucket', async () => {
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

    await fileService.saveFile(revolutFileDocument);
    await fileService.saveFile(otpFileDocument);
    await fileService.saveFile(ersteFileDocument);
    await storageService.uploadFile(getFileId(revolutFileDocument), fileDataFactory.revolut.file(revolutFileDocument.timezone, [revolutRow]));
    await storageService.uploadFile(getFileId(otpFileDocument), fileDataFactory.otp.file(otpFileDocument.timezone, [otpRow]));
    await storageService.uploadFile(getFileId(ersteFileDocument), fileDataFactory.erste.file(ersteFileDocument.timezone, [ersteRow]));
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  test('should trigger importing of revolut file', async () => {
    await expect.poll(async () => {
      const file = await fileService.findFileById(getFileId(revolutFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    expect(revolutFileDocument).toHaveBeenProcessed(await fileService.findFileById(getFileId(revolutFileDocument)));
    expect(await transactionService.listDraftTransactionsByFileId(getFileId(revolutFileDocument))).toHaveBeenImportedFromRevolutFile(revolutRow);
  });

  test('should trigger importing of import otp file', async () => {
    await expect.poll(async () => {
      const file = await fileService.findFileById(getFileId(otpFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    expect(otpFileDocument).toHaveBeenProcessed(await fileService.findFileById(getFileId(otpFileDocument)));
    expect(await transactionService.listDraftTransactionsByFileId(getFileId(otpFileDocument))).toHaveBeenImportedFromOtpFile(otpRow);
  });

  test('should trigger importing of import erste file', async () => {
    await expect.poll(async () => {
      const file = await fileService.findFileById(getFileId(ersteFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    expect(ersteFileDocument).toHaveBeenProcessed(await fileService.findFileById(getFileId(ersteFileDocument)));
    expect(await transactionService.listDraftTransactionsByFileId(getFileId(ersteFileDocument))).toHaveBeenImportedFromErsteFile(ersteRow);
  });
});
