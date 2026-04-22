import { File, Import } from '@household/shared/types/types';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { getFileId } from '@household/shared/common/utils';
import { FileProcessingStatus, FileType } from '@household/shared/enums';
import { test as fileApiTest, expect as domainExpect } from '@household/test/fixtures/file-api.fixture';
import { expect as transactionExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { test as storageTest } from '@household/test/fixtures/storage.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as fileDbTest } from '@household/test/fixtures/file-db.fixture';

const expect = mergeExpects(domainExpect, apiExpect, transactionExpect);

const test = mergeTests(fileApiTest, transactionDbTest, fileDbTest, storageTest);

test.describe('Import file', () => {
  let revolutFileDocument: File.Document;
  let otpFileDocument: File.Document;
  let ersteFileDocument: File.Document;
  let revolutRow: Import.Revolut;
  let otpRow: Import.Otp;
  let ersteRow: Import.Erste;

  test.beforeAll('uploading file to import bucket', async ({ saveFile, uploadFile }) => {
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

    await saveFile(revolutFileDocument);
    await saveFile(otpFileDocument);
    await saveFile(ersteFileDocument);
    await uploadFile(getFileId(revolutFileDocument), fileDataFactory.revolut.file(revolutFileDocument.timezone, [revolutRow]));
    await uploadFile(getFileId(otpFileDocument), fileDataFactory.otp.file(otpFileDocument.timezone, [otpRow]));
    await uploadFile(getFileId(ersteFileDocument), fileDataFactory.erste.file(ersteFileDocument.timezone, [ersteRow]));
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  test('should trigger importing of revolut file', async ({ listDraftTransactionsByFileId, findFileById }) => {
    await expect.poll(async () => {
      const file = await findFileById(getFileId(revolutFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    expect(revolutFileDocument).toHaveBeenProcessed(await findFileById(getFileId(revolutFileDocument)));
    expect(await listDraftTransactionsByFileId(getFileId(revolutFileDocument))).toHaveBeenImportedFromRevolutFile(getFileId(revolutFileDocument), revolutRow);
  });

  test('should trigger importing of import otp file', async ({ listDraftTransactionsByFileId, findFileById }) => {
    await expect.poll(async () => {
      const file = await findFileById(getFileId(otpFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    expect(otpFileDocument).toHaveBeenProcessed(await findFileById(getFileId(otpFileDocument)));
    expect(await listDraftTransactionsByFileId(getFileId(otpFileDocument))).toHaveBeenImportedFromOtpFile(getFileId(otpFileDocument), otpRow);
  });

  test('should trigger importing of import erste file', async ({ listDraftTransactionsByFileId, findFileById }) => {
    await expect.poll(async () => {
      const file = await findFileById(getFileId(ersteFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    expect(ersteFileDocument).toHaveBeenProcessed(await findFileById(getFileId(ersteFileDocument)));
    expect(await listDraftTransactionsByFileId(getFileId(ersteFileDocument))).toHaveBeenImportedFromErsteFile(getFileId(ersteFileDocument), ersteRow);
  });
});
