import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { Project } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'project',
    description: 'desc',
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProject(new Types.ObjectId().toString() as Project.IdType)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    describe('with test data created', () => {
      let projectDocument: Project.Document;
      beforeEach(() => {
        cy.saveProjectDocument(projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'))).then((document: Project.Document) => {
          projectDocument = document;
        });
      });

      it('should delete project', () => {
        cy .authenticate('admin1')
          .requestDeleteProject(projectDocument._id.toString() as Project.IdType)
          .expectNoContentResponse()
          .validateProjectDeleted(projectDocument._id.toString() as Project.IdType);
      });

      describe('in related transactions project', () => {

        beforeEach(() => {
        });
        it.skip('should be unset if project is deleted', () => {
        });
      });

    });

    describe('should return error', () => {
      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteProject(`${new Types.ObjectId()}-not-valid` as Project.IdType)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });
      });
    });
  });
});
