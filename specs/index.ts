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
import { listRecipients } from './paths/recipient/list-recipients';
import { createRecipient } from './paths/recipient/create-recipient';
import { getRecipient } from './paths/recipient/get-recipient';
import { updateRecipient } from './paths/recipient/update-recipient';
import { deleteRecipient } from './paths/recipient/delete-recipient';
import { mergeRecipients } from './paths/recipient/merge-recipients';
import { listCategories } from './paths/category/list-categories';
import { createCategory } from './paths/category/create-category';
import { getCategory } from './paths/category/get-category';
import { updateCategory } from './paths/category/update-category';
import { deleteCategory } from './paths/category/delete-category';
import { mergeCategories } from './paths/category/merge-categories';
import { createProduct } from './paths/product/create-product';
import { listProducts } from './paths/product/list-products';
import { updateProduct } from './paths/product/update-product';
import { deleteProduct } from './paths/product/delete-product';
import { mergeProducts } from './paths/product/merge-products';

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
  })
  .addPath('/recipient/v1/recipients', {
    ...listRecipients,
    ...createRecipient,
  })
  .addPath('/recipient/v1/recipients/{recipientId}', {
    ...getRecipient,
    ...updateRecipient,
    ...deleteRecipient,
  })
  .addPath('/recipient/v1/recipients/{recipientId}/merge', {
    ...mergeRecipients,
  })
  .addPath('/category/v1/categories', {
    ...listCategories,
    ...createCategory,
  })
  .addPath('/category/v1/categories/{categoryId}', {
    ...getCategory,
    ...updateCategory,
    ...deleteCategory,
  })
  .addPath('/category/v1/categories/{categoryId}/merge', {
    ...mergeCategories,
  })
  .addPath('/product/v1/categories/{categoryId}/products', {
    ...createProduct,
  })
  .addPath('/product/v1/products', {
    ...listProducts,
  })
  .addPath('/product/v1/products/{productId}', {
    ...updateProduct,
    ...deleteProduct,
  })
  .addPath('/product/v1/products/{productId}/merge', {
    ...mergeProducts,
  });

writeFileSync('specs/household.json', document.getSpecAsJson(undefined, 2));
