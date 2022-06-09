import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { default as schema } from '@household/test/api/schemas/project-response';
import { Project } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('GET /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'project',
    description: 'desc',
  };

  describe('called as anonymous', () => {
    it.skip('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetProject(new Types.ObjectId().toString() as Project.IdType)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('with test data created', () => {
      let projectDocument: Project.Document;

      beforeEach(() => {
        cy.projectTask('saveProject', [projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'))]).then((document: Project.Document) => {
          projectDocument = document;
        });
      });

      it('should get project by id', () => {
        cy.authenticate('admin1')
          .requestGetProject(projectDocument._id.toString() as Project.IdType)
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateProjectResponse(projectDocument);
      });
    });

    describe('should return error if projectId', () => {
      it('is not mongo id', () => {
        cy.authenticate('admin1')
          .requestGetProject(`${new Types.ObjectId().toString()}-not-valid` as Project.IdType)
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('projectId', 'pathParameters');
      });

      it('does not belong to any project', () => {
        cy.authenticate('admin1')
          .requestGetProject(new Types.ObjectId().toString() as Project.IdType)
          .expectNotFoundResponse();
      });
    });
  });
});
