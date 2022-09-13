import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as schema } from '@household/test/api/schemas/project-response';
import { Project } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { createProjectId } from '@household/shared/common/test-data-factory';

describe('GET /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'project',
    description: 'desc',
  };

  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'));
    projectDocument._id = new Types.ObjectId();
  });

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetProject(createProjectId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get project by id', () => {
      cy.saveProjectDocument(projectDocument)
        .authenticate('admin1')
        .requestGetProject(createProjectId(projectDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateProjectResponse(projectDocument);
    });

    describe('should return error if projectId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetProject(createProjectId('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('projectId', 'pathParameters');
      });

      it('does not belong to any project', () => {
        cy.authenticate('admin1')
          .requestGetProject(createProjectId())
          .expectNotFoundResponse();
      });
    });
  });
});
