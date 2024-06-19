import { default as schema } from '@household/test/api/schemas/project-response';
import { Project } from '@household/shared/types/types';
import { getProjectId } from '@household/shared/common/utils';
import { projectDataFactory } from './data-factory';

describe('GET /project/v1/projects/{projectId}', () => {
  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetProject(projectDataFactory.id())
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
          .requestGetProject(projectDataFactory.id('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('projectId', 'pathParameters');
      });

      it('does not belong to any project', () => {
        cy.authenticate(1)
          .requestGetProject(projectDataFactory.id())
          .expectNotFoundResponse();
      });
    });
  });
});
