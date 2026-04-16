import { headerExpiresIn } from '@household/shared/constants';
import { File } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type FileApiFixture = {
  requestCreateUploadUrl(file: File.Request): Promise<APIResponse>;
  requestUploadFile(fileUpload: File.Url & File.FileId): Promise<File.FileId>;
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
    const requestUploadFile = async ({ url, fileId }: File.Url & File.FileId) => {
      await request.put(url);
      return {
        fileId,
      };
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

export const expect = baseExpect.extend({});
