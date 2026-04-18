import { getFileId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { FileProcessingStatus } from '@household/shared/enums';
import { File } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { createComparer } from '@household/test/utils';
import { APIResponse } from '@playwright/test';

type FileApiFixture = {
  requestCreateUploadUrl(file: File.Request): Promise<APIResponse>;
  requestUploadFile(url: File.Url['url']): Promise<APIResponse>;
  requestListFiles(): Promise<APIResponse>;
  requestDeleteFile(fileId: File.Id): Promise<APIResponse>;
};

export const test = baseTest.extend<FileApiFixture>({
  requestCreateUploadUrl: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateUploadUrl = async (file: File.Request) => {
      return request.post(`${process.env.BASE_URL}/file/v1/files`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: file,
      });
    };

    await use(requestCreateUploadUrl);
  },
  requestUploadFile: async ({ request }, use) => {
    const requestUploadFile = async (url: File.Url['url']) => {
      return request.put(url);
    };

    await use(requestUploadFile);
  },
  requestListFiles: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListFiles = async () => {
      return request.get(`${process.env.BASE_URL}/file/v1/files`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListFiles);
  },
  requestDeleteFile: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteFile = async (fileId: File.Id) => {
      return request.delete(`${process.env.BASE_URL}/file/v1/files/${fileId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteFile);
  },
});

export const expect = baseExpect.extend({
  async toBeStoredInDatabase(req: File.Request, document: File.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected file to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        fileType: compare(document.fileType, req.fileType),
        timezone: compare(document.timezone, req.timezone),
        draftCount: compare(document.draftCount, undefined),
        processingStatus: compare(document.processingStatus, FileProcessingStatus.Pending),
      };
    });

    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !message,
      message: () => message,
    };
  },
  toHaveBeenDeletedFromDatabase(document: File.Document) {
    return {
      pass: !document,
      message: () => `expected file to be deleted from database, but it was found with id ${getFileId(document)}`,
    };
  },
  toBeStoredInS3(file: any) {
    return {
      pass: !!file,
      message: () => 'expected file to be stored in S3, but it was not found',
    };
  },
  toHaveBeenDeletedFromS3(file: any) {
    return {
      pass: !file,
      message: () => 'expected file to be deleted from S3, but it was found',
    };
  },
  async toMatchFileDocumentInList(received: APIResponse, document: File.Document, draftCount: number) {
    const response = await received.json() as File.Response[];
    const matchingResponse = response.find(r => r.fileId === getFileId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a file with id ${getFileId(document)}, but it was not found`,
      };
    }

    const comparer = createComparer((compare) => {
      return {
        fileId: compare(matchingResponse.fileId, getFileId(document)),
        fileType: compare(matchingResponse.fileType, document.fileType),
        draftCount: compare(matchingResponse.draftCount, draftCount),
      };
    });

    const message = comparer.validate(matchingResponse, 'uploadedAt');
  
    return {
      pass: !message,
      message: () => message,
    };
  }, 
  toHaveBeenProcessed(originalDocument: File.Document, currentDocument: File.Document) {

    const comparer = createComparer((compare) => {
      return {
        fileType: compare(currentDocument.fileType, originalDocument.fileType),
        timezone: compare(currentDocument.timezone, originalDocument.timezone),
        draftCount: compare(currentDocument.draftCount, undefined),
        processingStatus: compare(currentDocument.processingStatus, FileProcessingStatus.Completed),
      };
    });

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !message,
      message: () => message,
    };
  },
});
