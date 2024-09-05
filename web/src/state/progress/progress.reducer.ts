import { Category, Product, Project, Recipient } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { productApiActions } from '@household/web/state/product/product.actions';

export type ProgressState = {
  counter: number;
  projectsToRemove: Project.Id[];
  inProgressCategories: Category.Id[];
  recipientsToRemove: Recipient.Id[];
  inProgressProducts: Product.Id[];
};

export const progressReducer = createReducer<ProgressState>({
  counter: 0,
  projectsToRemove: [],
  recipientsToRemove: [],
  inProgressCategories: [],
  inProgressProducts: [],
},
on(progressActions.processStarted, (_state) => {
  return {
    ..._state,
    counter: _state.counter + 1,
  };
}),
on(progressActions.processFinished, (_state) => {
  return {
    ..._state,
    counter: _state.counter - 1,
  };
}),
on(projectApiActions.deleteProjectInitiated, (_state, { projectId }) => {
  return {
    ..._state,
    projectsToRemove: [
      ..._state.projectsToRemove,
      projectId,
    ],
  };
}),
on(projectApiActions.deleteProjectCompleted, projectApiActions.deleteProjectFailed, (_state, { projectId }) => {
  return {
    ..._state,
    projectsToRemove: _state.projectsToRemove.filter(p => p !== projectId),
  };
}),
on(projectApiActions.mergeProjectsInitiated, (_state, { sourceProjectIds }) => {
  return {
    ..._state,
    projectsToRemove: [
      ..._state.projectsToRemove,
      ...sourceProjectIds,
    ],
  };
}),
on(projectApiActions.mergeProjectsCompleted, projectApiActions.mergeProjectsFailed, (_state, { sourceProjectIds }) => {
  return {
    ..._state,
    projectsToRemove: _state.projectsToRemove.filter(p => !sourceProjectIds.includes(p)),
  };
}),

on(recipientApiActions.deleteRecipientInitiated, (_state, { recipientId }) => {
  return {
    ..._state,
    recipientsToRemove: [
      ..._state.recipientsToRemove,
      recipientId,
    ],
  };
}),
on(recipientApiActions.deleteRecipientCompleted, recipientApiActions.deleteRecipientFailed, (_state, { recipientId }) => {
  return {
    ..._state,
    recipientsToRemove: _state.recipientsToRemove.filter(p => p !== recipientId),
  };
}),
on(recipientApiActions.mergeRecipientsInitiated, (_state, { sourceRecipientIds }) => {
  return {
    ..._state,
    recipientsToRemove: [
      ..._state.recipientsToRemove,
      ...sourceRecipientIds,
    ],
  };
}),
on(recipientApiActions.mergeRecipientsCompleted, recipientApiActions.mergeRecipientsFailed, (_state, { sourceRecipientIds }) => {
  return {
    ..._state,
    recipientsToRemove: _state.recipientsToRemove.filter(p => !sourceRecipientIds.includes(p)),
  };
}),

on(categoryApiActions.updateCategoryInitiated, (_state, { categoryId }) => {

  return {
    ..._state,
    inProgressCategories: [
      ..._state.inProgressCategories,
      categoryId,
    ],
  };
}),

on(categoryApiActions.deleteCategoryInitiated, (_state, { categoryId }) => {
  return {
    ..._state,
    inProgressCategories: [
      ..._state.inProgressCategories,
      categoryId,
    ],
  };
}),
on(categoryApiActions.deleteCategoryFailed, (_state, { categoryId }) => {
  return {
    ..._state,
    inProgressCategories: _state.inProgressCategories.filter(p => p !== categoryId),
  };
}),
on(categoryApiActions.mergeCategoriesInitiated, (_state, { sourceCategoryIds }) => {
  return {
    ..._state,
    inProgressCategories: [
      ..._state.inProgressCategories,
      ...sourceCategoryIds,
    ],
  };
}),
on(categoryApiActions.mergeCategoriesFailed, (_state, { sourceCategoryIds }) => {
  return {
    ..._state,
    inProgressCategories: _state.inProgressCategories.filter(p => !sourceCategoryIds.includes(p)),
  };
}),

on(categoryApiActions.listCategoriesCompleted, (_state) => {
  return {
    ..._state,
    inProgressCategories: [],
  };
}),

on(productApiActions.deleteProductInitiated, (_state, { productId }) => {
  return {
    ..._state,
    inProgressProducts: [
      ..._state.inProgressProducts,
      productId,
    ],
  };
}),
on(productApiActions.deleteProductCompleted, productApiActions.deleteProductFailed, (_state, { productId }) => {
  return {
    ..._state,
    inProgressProducts: _state.inProgressProducts.filter(p => p !== productId),
  };
}),

on(productApiActions.mergeProductsInitiated, (_state, { sourceProductIds }) => {
  return {
    ..._state,
    inProgressProducts: [
      ..._state.inProgressProducts,
      ...sourceProductIds,
    ],
  };
}),

on(productApiActions.mergeProductsCompleted, productApiActions.mergeProductsFailed, (_state, { sourceProductIds }) => {
  return {
    ..._state,
    inProgressProducts: _state.inProgressProducts.filter(p => !sourceProductIds.includes(p)),
  };
}),
);
