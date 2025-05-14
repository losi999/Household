import { Project } from '@household/shared/types/types';
import { CommandFunction } from '@household/test/api/types';
import { IProjectService } from '@household/shared/services/project-service';

const saveProjectDocument = (...params: Parameters<IProjectService['saveProject']>) => {
  return cy.task<Project.Document>('saveProject', params);
};

const saveProjectDocuments = (...params: Parameters<IProjectService['saveProjects']>) => {
  return cy.task<Project.Document>('saveProjects', params);
};

const getProjectDocumentById = (...params: Parameters<IProjectService['getProjectById']>) => {
  return cy.task<Project.Document>('getProjectById', params);
};

export const setProjectTaskCommands = () => {
  Cypress.Commands.addAll({
    saveProjectDocument,
    saveProjectDocuments,
    getProjectDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveProjectDocument: CommandFunction<typeof saveProjectDocument>;
      saveProjectDocuments: CommandFunction<typeof saveProjectDocuments>;
      getProjectDocumentById: CommandFunction<typeof getProjectDocumentById>
    }
  }
}
