import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';

export const projectDataFactory = (() => {
  const createProjectRequest: DataFactoryFunction<Project.Request> = (req) => {
    return {
      name: faker.word.words({
        count: {
          min: 1,
          max: 3,
        },
      }),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      ...req,
    };
  };

  const createProjectDocument: DataFactoryFunction<Project.Request, Project.Document> = (req) => {
    return projectDocumentConverter.create(createProjectRequest(req), Cypress.env('EXPIRES_IN'), true);
  };

  return {
    id: (createId<Project.Id>),
    request: createProjectRequest,
    document: createProjectDocument,
  };
})();
