import { writeFileSync } from 'fs';
import { OpenApiBuilder } from 'openapi3-ts/oas32';
import { listAccounts } from './paths/account/list-accounts';
import { createAccount } from './paths/account/create-account';
import { getAccount } from './paths/account/get-account';
import { updateAccount } from './paths/account/update-account';
import { deleteAccount } from './paths/account/delete-account';

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
  });

writeFileSync('specs/household.json', document.getSpecAsJson(undefined, 2));
