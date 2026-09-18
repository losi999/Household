import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const projectDataFactory = (() => {
  const createProjectDocument: DataFactoryFunction<Requests.Project, Documents.Project> = (req) => {
    return projectDocumentConverter.create(testDataFactory.project.request(req), Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: testDataFactory.project.id,
    request: testDataFactory.project.request,
    document: createProjectDocument,
  };
})();
