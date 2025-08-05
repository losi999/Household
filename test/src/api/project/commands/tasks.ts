import { Project } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IProjectService } from '@household/shared/services/project-service';

const saveProjectDocument = (...params: Parameters<IProjectService['saveProject']>) => {
  return cy.task<Project.Document>('saveProject', params);
};

const saveProjectDocuments = (...params: Parameters<IProjectService['saveProjects']>) => {
  return cy.task<Project.Document>('saveProjects', params);
};

const findProjectDocumentById = (...params: Parameters<IProjectService['findProjectById']>) => {
  return cy.task<Project.Document>('findProjectById', params);
};

export const setProjectTaskCommands = () => {
  Cypress.Commands.addAll({
    saveProjectDocument,
    saveProjectDocuments,
    findProjectDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveProjectDocument: CommandFunction<typeof saveProjectDocument>;
      saveProjectDocuments: CommandFunction<typeof saveProjectDocuments>;
      findProjectDocumentById: CommandFunction<typeof findProjectDocumentById>
    }
  }
}
