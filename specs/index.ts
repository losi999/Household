import { writeFileSync } from 'fs';
import { OpenApiBuilder } from 'openapi3-ts/oas32';
import { listAccounts } from './paths/account/list-accounts';
import { createAccount } from './paths/account/create-account';
import { getAccount } from './paths/account/get-account';
import { updateAccount } from './paths/account/update-account';
import { deleteAccount } from './paths/account/delete-account';
import { listProjects } from './paths/project/list-projects';
import { createProject } from './paths/project/create-project';
import { getProject } from './paths/project/get-project';
import { updateProject } from './paths/project/update-project';
import { deleteProject } from './paths/project/delete-project';
import { mergeProjects } from './paths/project/merge-projects';

const document = new OpenApiBuilder()
  .addOpenApiVersion('3.1.0')
  .addInfo({
    title: 'Household API',
    version: '1.0.0',
  })
  .addPath('/account/v1/accounts', {
    ...listAccounts,
    ...createAccount,
  })
  .addPath('/account/v1/accounts/{accountId}', {
    ...getAccount,
    ...updateAccount,
    ...deleteAccount,
  })
  .addPath('/project/v1/projects', {
    ...listProjects,
    ...createProject,
  })
  .addPath('/project/v1/projects/{projectId}', {
    ...getProject,
    ...updateProject,
    ...deleteProject,
  })
  .addPath('/project/v1/projects/{projectId}/merge', {
    ...mergeProjects,
  });

writeFileSync('specs/household.json', document.getSpecAsJson(undefined, 2));
