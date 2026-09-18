import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { getFileId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { FileProcessingStatus } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface IFileDocumentConverter {
  create(body: Requests.File, expiresIn: number, generateId?: boolean): Documents.File;
  updateStatus(status: FileProcessingStatus): DocumentUpdate<Documents.File>;
  toResponse(document: Documents.File): Responses.File;
  toResponseList(documents: Documents.File[]): Responses.File[]
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
        update: {
          $set: {
            processingStatus: status,
          },
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
