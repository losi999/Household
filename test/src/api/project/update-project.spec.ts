import { createProjectId } from '@household/shared/common/test-data-factory';
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

  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'));
    projectDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateProject(createProjectId(), projectToUpdate)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should update project', () => {
      it('with complete body', () => {
        cy
          .saveProjectDocument(projectDocument)
          .authenticate('admin1')
          .requestUpdateProject(createProjectId(projectDocument._id), projectToUpdate)
          .expectCreatedResponse()
          .validateProjectDocument(projectToUpdate);
      });

      describe('without optional property in body', () => {
        it('description', () => {
          const modifiedRequest: Project.Request = {
            ...projectToUpdate,
            description: undefined,
          };
          cy.saveProjectDocument(projectDocument)
            .authenticate('admin1')
            .requestUpdateProject(createProjectId(projectDocument._id), modifiedRequest)
            .expectCreatedResponse()
            .validateProjectDocument(modifiedRequest);
        });
      });
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId(), {
              ...project,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId(), {
              ...project,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId(), {
              ...project,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId(), {
              ...project,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId(), {
              ...project,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId('not-valid'), projectToUpdate)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });

        it('does not belong to any project', () => {
          cy.authenticate('admin1')
            .requestUpdateProject(createProjectId(), projectToUpdate)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
