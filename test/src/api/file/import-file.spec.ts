import { fileDataFactory } from '@household/test/api/file/data-factory';
import { getFileId } from '@household/shared/common/utils';
import { FileProcessingStatus, FileType } from '@household/shared/enums';
import { fileApiTest, fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { storageTest } from '@household/test/fixtures/storage.fixture';
import { mergeTests } from '@playwright/test';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { fileDbTest } from '@household/test/fixtures/file-db.fixture';

const test = mergeTests(fileApiTest, transactionDbTest, fileDbTest, storageTest);

test.describe('Import file', () => {
  test('should trigger importing of revolut file', async ({ listDraftTransactionsByFileId, findFileById, saveFile, uploadFile }) => {
    const revolutFileDocument = fileDataFactory.document({
      fileType: FileType.Revolut,
    });

    const revolutRow = fileDataFactory.revolut.row();

    await saveFile(revolutFileDocument);

    await uploadFile(getFileId(revolutFileDocument), fileDataFactory.revolut.file(revolutFileDocument.timezone, [revolutRow]));

    await fileApiExpect.poll(async () => {
      const file = await findFileById(getFileId(revolutFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    fileApiExpect(revolutFileDocument).toHaveBeenProcessed(await findFileById(getFileId(revolutFileDocument)));
    transactionApiExpect(await listDraftTransactionsByFileId(getFileId(revolutFileDocument))).toHaveBeenImportedFromRevolutFile(getFileId(revolutFileDocument), revolutRow);
  });

  test('should trigger importing of import otp file', async ({ listDraftTransactionsByFileId, findFileById, saveFile, uploadFile }) => {
    const otpFileDocument = fileDataFactory.document({
      fileType: FileType.Otp,
    });
    const otpRow = fileDataFactory.otp.row();

    await saveFile(otpFileDocument);
    await uploadFile(getFileId(otpFileDocument), fileDataFactory.otp.file(otpFileDocument.timezone, [otpRow]));

    await fileApiExpect.poll(async () => {
      const file = await findFileById(getFileId(otpFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    fileApiExpect(otpFileDocument).toHaveBeenProcessed(await findFileById(getFileId(otpFileDocument)));
    transactionApiExpect(await listDraftTransactionsByFileId(getFileId(otpFileDocument))).toHaveBeenImportedFromOtpFile(getFileId(otpFileDocument), otpRow);
  });

  test('should trigger importing of import erste file', async ({ listDraftTransactionsByFileId, findFileById, saveFile, uploadFile }) => {
    const ersteFileDocument = fileDataFactory.document({
      fileType: FileType.Erste,
    });
    const ersteRow = fileDataFactory.erste.row();
    await saveFile(ersteFileDocument);
    await uploadFile(getFileId(ersteFileDocument), fileDataFactory.erste.file(ersteFileDocument.timezone, [ersteRow]));

    await fileApiExpect.poll(async () => {
      const file = await findFileById(getFileId(ersteFileDocument));
      return file.processingStatus;
    }, {
      timeout: 10000,
      intervals: [3000],
    }).toBe(FileProcessingStatus.Completed);
    fileApiExpect(ersteFileDocument).toHaveBeenProcessed(await findFileById(getFileId(ersteFileDocument)));
    transactionApiExpect(await listDraftTransactionsByFileId(getFileId(ersteFileDocument))).toHaveBeenImportedFromErsteFile(getFileId(ersteFileDocument), ersteRow);
  });
});
