import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as schema } from '@household/test/api/schemas/project-response-list';
import { Project } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('GET /project/v1/projects', () => {
  let projectDocument1: Project.Document;
  let projectDocument2: Project.Document;

  beforeEach(() => {
    projectDocument1 = projectDocumentConverter.create({
      name: `project 1-${uuid()}`,
      description: 'description 1',
    }, Cypress.env('EXPIRES_IN'), true);
    projectDocument2 = projectDocumentConverter.create({
      name: `project 2-${uuid()}`,
      description: 'description 2',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetProjectList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of projects', () => {
      cy.saveProjectDocument(projectDocument1)
        .saveProjectDocument(projectDocument2)
        .authenticate(1)
        .requestGetProjectList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateProjectListResponse([
          projectDocument1,
          projectDocument2,
        ]);
    });
  });
});
