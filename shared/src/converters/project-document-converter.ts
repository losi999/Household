import { generateMongoId } from '@household/shared/common/utils';
import { addSeconds, getProjectId } from '@household/shared/common/utils';
import { Project } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface IProjectDocumentConverter {
  create(body: Project.Request, expiresIn: number, generateId?: boolean): Project.Document;
  update(body: Project.Request, expiresIn: number): UpdateQuery<Project.Document>;
  toResponse(doc: Project.Document): Project.ConvertedResponse;
  toReport(doc: Project.Document): Project.Report;
  toResponseList(docs: Project.Document[]): Project.Response[];
}

export const projectDocumentConverterFactory = (): IProjectDocumentConverter => {
  const instance: IProjectDocumentConverter = {
    create: (body, expiresIn, generateId): Project.Document => {
      return {
        ...body,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn): UpdateQuery<Project.Document> => {
      const update: UpdateQuery<Project.Document> = {
        $set: {
          ...body,
          expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        },
      };

      if (!body.description) {
        update.$unset = {
          description: true,
        };
      }

      return update;
    },
    toResponse: (doc): Project.ConvertedResponse => {
      return {
        ...doc,
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        expiresAt: undefined,
        projectId: getProjectId(doc),
      };
    },

    toReport: (doc): Project.Report => {
      return doc ? {
        projectId: getProjectId(doc),
        name: doc.name,
      } : undefined;
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
