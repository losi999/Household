import { generateMongoId, getFileId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { File } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IFileDocumentConverter {
  create(body: File.Request, expiresIn: number, generateId?: boolean): File.Document;
  updateStatus(status: File.ProcessingStatus['processingStatus']): UpdateQuery<File.Document>;
  toResponse(document: File.Document): File.Response;
  toResponseList(documents: File.Document[]): File.Response[]
}

export const fileDocumentConverterFactory = (): IFileDocumentConverter => {
  const instance: IFileDocumentConverter = {
    create: (body, expiresIn, generateId) => {
      return {
        ...body,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    updateStatus: (status) => {
      return {
        $set: {
          processingStatus: status,
        },
      };
    },
    toResponse: ({ _id, createdAt, fileType, draftCount }) => ({
      fileId: getFileId(_id),
      fileType,
      uploadedAt: createdAt.toISOString(),
      draftCount,
    }),
    toResponseList: (documents) => documents.map(d => instance.toResponse(d)),
  };

  return instance;
};
