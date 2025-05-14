import { default as schema } from '@household/test/api/schemas/project-response';
import { Project } from '@household/shared/types/types';
import { getProjectId } from '@household/shared/common/utils';
import { projectDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

describe('GET /project/v1/projects/{projectId}', () => {
  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetProject(projectDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should get project by id', () => {
      cy.saveProjectDocument(projectDocument)
        .authenticate(UserType.Editor)
        .requestGetProject(getProjectId(projectDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateProjectResponse(projectDocument);
    });

    describe('should return error if projectId', () => {
      it('is not mongo id', () => {
        cy.authenticate(UserType.Editor)
          .requestGetProject(projectDataFactory.id('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('projectId', 'pathParameters');
      });

      it('does not belong to any project', () => {
        cy.authenticate(UserType.Editor)
          .requestGetProject(projectDataFactory.id())
          .expectNotFoundResponse();
      });
    });
  });
});
