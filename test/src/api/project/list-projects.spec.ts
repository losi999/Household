import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as schema } from '@household/test/api/schemas/project-response-list';
import { Project } from '@household/shared/types/types';

describe('GET /project/v1/projects', () => {
  const project1: Project.Request = {
    name: 'project 1',
    description: 'description 1',
  };

  const project2: Project.Request = {
    name: 'project 2',
    description: 'description 2',
  };

  let projectDocument1: Project.Document;
  let projectDocument2: Project.Document;

  beforeEach(() => {
    projectDocument1 = projectDocumentConverter.create(project1, Cypress.env('EXPIRES_IN'));
    projectDocument2 = projectDocumentConverter.create(project2, Cypress.env('EXPIRES_IN'));
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
        .expectValidResponseSchema(schema);
    });
  });
});
