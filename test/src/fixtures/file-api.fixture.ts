import { getFileId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { FileProcessingStatus } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
import { Responses } from '@household/shared/types/responses';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { Comparer } from '@household/test/comparer';
import { APIResponse } from '@playwright/test';

type FileApiFixture = {
  requestCreateUploadUrl(file: Requests.File): Promise<APIResponse>;
  requestUploadFile(url: Api.File.Url['url']): Promise<APIResponse>;
  requestListFiles(): Promise<APIResponse>;
  requestDeleteFile(fileId: Api.File.Id): Promise<APIResponse>;
};

export const test = baseTest.extend<FileApiFixture>({
  requestCreateUploadUrl: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateUploadUrl = async (file: Requests.File) => {
      return loggedRequest.post(`${process.env.BASE_URL}/file/v1/files`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: file,
      });
    };

    await use(requestCreateUploadUrl);
  },
  requestUploadFile: async ({ loggedRequest }, use) => {
    const requestUploadFile = async (url: Api.File.Url['url']) => {
      return loggedRequest.put(url);
    };

    await use(requestUploadFile);
  },
  requestListFiles: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListFiles = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/file/v1/files`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListFiles);
  },
  requestDeleteFile: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteFile = async (fileId: Api.File.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/file/v1/files/${fileId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteFile);
  },
});

export const expect = baseExpect.extend({
  async toHaveBeenSavedAsFileDocument(req: Requests.File, document: Documents.File) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected file to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      fileType: req.fileType,
      timezone: req.timezone,
      draftCount: undefined,
      processingStatus: FileProcessingStatus.Pending,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected file to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Documents.File) {
    return {
      pass: !document,
      message: () => `Expected file to be deleted from database, but it was found with id ${getFileId(document)}`,
    };
  },
  toHaveBeenStoredInS3(file: any) {
    return {
      pass: !!file,
      message: () => 'Expected file to be stored in S3, but it was not found',
    };
  },
  toHaveBeenDeletedFromS3(file: any) {
    return {
      pass: !file,
      message: () => 'Expected file to be deleted from S3, but it was found',
    };
  },
  async toContainMatchingFileDocument(received: APIResponse, document: Documents.File, draftCount: number) {
    const response = await received.json() as Responses.File[];
    const matchingResponse = response.find(r => r.fileId === getFileId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a file with id ${getFileId(document)}, but it was not found`,
      };
    }

    const comparer = new Comparer(matchingResponse, {
      fileId: getFileId(document),
      fileType: document.fileType,
      draftCount: draftCount,
    }, 'uploadedAt');

    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected response to contain a matching file document, but it did not:\n${errors.join('\n')}`,
    };
  }, 
  toHaveBeenProcessed(originalDocument: Documents.File, currentDocument: Documents.File) {

    const comparer = new Comparer(currentDocument, {
      fileType: originalDocument.fileType,
      timezone: originalDocument.timezone,
      draftCount: undefined,
      processingStatus: FileProcessingStatus.Completed,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected file to be processed, but it was not:\n${errors.join('\n')}`,
    };
  },
});
