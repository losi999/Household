import { generateMongoId } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { File } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IFileDocumentConverter {
  create(body: File.Request, expiresIn: number, generateId?: boolean): File.Document;
  updateStatus(status: File.ProcessingStatus['processingStatus']): UpdateQuery<File.Document>;
  // update(data: { document: Restrict<File.Document, 'updatedAt'>; body: File.Request }, expiresIn: number): File.Document;
  // toResponse(doc: File.Document): File.Response;
  // toReport(doc: File.Document): File.Report;
  // toResponseList(docs: File.Document[]): File.Response[];
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
    // update: ({ document: { _id, createdAt }, body }, expiresIn): File.Document => {
    //   return {
    //     ...instance.create(body, expiresIn),
    //     _id,
    //     createdAt,
    //   };
    // },
    // toResponse: (doc): File.Response => {
    //   return {
    //     ...doc,
    //     fileId: getFileId(doc),
    //     createdAt: undefined,
    //     updatedAt: undefined,
    //     _id: undefined,
    //     expiresAt: undefined,
    //   };
    // },
    // toReport: (doc): File.Report => {
    //   return doc ? {
    //     fileId: getFileId(doc),
    //     name: doc.name,
    //   } : undefined;
    // },
    // toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
