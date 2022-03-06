import { addSeconds } from '@household/shared/common/utils';
import { Restrict } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';

export interface IProjectDocumentConverter {
  create(body: Project.Request, expiresIn: number): Project.Document;
  update(data: {
    document: Restrict<Project.Document, 'updatedAt'>;
    body: Project.Request;
  }, expiresIn: number): Project.Document;
  toResponse(doc: Project.Document): Project.Response;
  toResponseList(docs: Project.Document[]): Project.Response[];
}

export const projectDocumentConverterFactory = (): IProjectDocumentConverter => {
  const instance: IProjectDocumentConverter = {
    create: (body, expiresIn): Project.Document => {
      return {
        ...body,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: ({ document, body }, expiresIn): Project.Document => {
      return {
        ...document,
        ...body,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    toResponse: (doc): Project.Response => {
      return {
        ...doc,
        _id: undefined,
        expiresAt: undefined,
        projectId: doc._id.toString() as Project.IdType,
      }
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};