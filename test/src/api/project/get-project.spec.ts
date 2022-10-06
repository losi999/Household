import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as schema } from '@household/test/api/schemas/project-response';
import { Project } from '@household/shared/types/types';
import { createProjectId } from '@household/shared/common/test-data-factory';
import { getProjectId } from '@household/shared/common/utils';

describe('GET /project/v1/projects/{projectId}', () => {
  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create({
      name: 'project',
      description: 'desc',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetProject(createProjectId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get project by id', () => {
      cy.saveProjectDocument(projectDocument)
        .authenticate(1)
        .requestGetProject(getProjectId(projectDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateProjectResponse(projectDocument);
    });

    describe('should return error if projectId', () => {
      it('is not mongo id', () => {
        cy.authenticate(1)
          .requestGetProject(createProjectId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('projectId', 'pathParameters');
      });

      it('does not belong to any project', () => {
        cy.authenticate(1)
          .requestGetProject(createProjectId())
          .expectNotFoundResponse();
      });
    });
  });
});
