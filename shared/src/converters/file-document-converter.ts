import { generateMongoId } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { File } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IFileDocumentConverter {
  create(body: File.Request, expiresIn: number, generateId?: boolean): File.Document;
  updateStatus(status: File.ProcessingStatus['processingStatus']): UpdateQuery<File.Document>;
}

export const fileDocumentConverterFactory = (): IFileDocumentConverter => {
  const instance: IFileDocumentConverter = {
    create: (body, expiresIn, generateId): File.Document => {
      return {
        ...body,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    updateStatus: (status): UpdateQuery<File.Document> => {
      return {
        $set: {
          processingStatus: status,
        },
      };
    },
  };

  return instance;
};
