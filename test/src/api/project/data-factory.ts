import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/utils';

export const projectDataFactory = (() => {
  const createProjectRequest: DataFactoryFunction<Requests.Project> = (req) => {
    return {
      name: `${faker.commerce.department()} ${faker.string.uuid()}`,
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      ...req,
    };
  };

  const createProjectDocument: DataFactoryFunction<Requests.Project, Documents.Project> = (req) => {
    return projectDocumentConverter.create(createProjectRequest(req), Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: (createId<Api.Project.Id>),
    request: createProjectRequest,
    document: createProjectDocument,
  };
})();
