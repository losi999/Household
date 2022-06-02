import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { Project } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('PUT /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'old name',
    description: 'old desc',
  };

  const projectToUpdate: Project.Request = {
    name: 'new name',
    description: 'new desc',
  };

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateProject(new Types.ObjectId().toString() as Project.IdType, projectToUpdate)
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
      it('should update a project', () => {
        cy
          .authenticate('admin1')
          .requestUpdateProject(projectDocument._id.toString() as Project.IdType, projectToUpdate)
          .expectCreatedResponse()
          .validateProjectDocument(projectToUpdate, projectDocument._id.toString() as Project.IdType);
      });
    });
    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(new Types.ObjectId().toString() as Project.IdType, {
              ...project,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(new Types.ObjectId().toString() as Project.IdType, {
              ...project,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateProject({
              ...project,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });
      });

      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(`${new Types.ObjectId().toString()}-not-valid` as Project.IdType, projectToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });

        it('does not belong to any project', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(new Types.ObjectId().toString() as Project.IdType, projectToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
