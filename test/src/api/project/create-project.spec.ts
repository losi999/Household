import { Project } from '@household/shared/types/types';

describe('POST project/v1/projects', () => {
  const request: Project.Request = {
    name: 'name',
    description: 'description',
  };

  describe('called as an admin', () => {

    it('should create project', () => {
      cy.authenticate('admin1')
        .requestCreateProject(request)
        .expectCreatedResponse()
        .validateProjectDocument(request);
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate('admin1')
            .requestCreateProject({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateProject({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestCreateProject({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate('admin1')
            .requestCreateProject({
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate('admin1')
            .requestCreateProject({
              ...request,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });
    });
  });
});
