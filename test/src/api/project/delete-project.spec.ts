import { createProjectId } from '@household/shared/common/test-data-factory';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { Project } from '@household/shared/types/types';
import { Types } from 'mongoose';

describe('DELETE /project/v1/projects/{projectId}', () => {
  const project: Project.Request = {
    name: 'project',
    description: 'desc',
  };

  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDocumentConverter.create(project, Cypress.env('EXPIRES_IN'));
    projectDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProject(createProjectId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete project', () => {
      cy .authenticate('admin1')
        .requestDeleteProject(createProjectId(projectDocument._id))
        .expectNoContentResponse()
        .validateProjectDeleted(createProjectId(projectDocument._id));
    });

    describe('in related transactions project', () => {

      beforeEach(() => {
      });
      it.skip('should be unset if project is deleted', () => {
      });
    });

    describe('should return error', () => {
      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestDeleteProject(createProjectId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });
      });
    });
  });
});
