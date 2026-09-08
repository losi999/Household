import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getProjectId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { UpdateQuery } from 'mongoose';

export interface IProjectDocumentConverter {
  create(body: Requests.Project, expiresIn: number, generateId?: boolean): Documents.Project;
  update(body: Requests.Project, expiresIn: number): DocumentUpdate<Documents.Project>;
  toResponse(doc: Documents.Project): Responses.Project;
  toReport(doc: Documents.Project): Responses.ProjectReport;
  toResponseList(docs: Documents.Project[]): Responses.Project[];
}

export const projectDocumentConverterFactory = (): IProjectDocumentConverter => {
  const instance: IProjectDocumentConverter = {
    create: ({ name, description }, expiresIn, generateId) => {
      return {
        description,
        name,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      const update: UpdateQuery<Documents.Project> = {
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

      return {
        update,
      };
    },
    toResponse: ({ description, _id, name }) => {
      return {
        name,
        description,
        projectId: getProjectId(_id),
      };
    },

    toReport: (doc) => {
      return doc ? {
        projectId: getProjectId(doc),
        name: doc.name,
      } : undefined;
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
