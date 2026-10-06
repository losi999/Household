import { Searchable } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withCategoryApiEvents } from '@household/state/category/with-category-api-events';
import { withCategoryEvents } from '@household/state/category/with-category-events';
import { withCategoryReducer } from '@household/state/category/with-category-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const PROJECT_STORE_INITIAL_STATE = new InjectionToken<CategoryState>('PROJECT_STORE_INITIAL_STATE');

export type CategoryState = {
  categoryList: Searchable<Responses.Category>[];
  isInProgress: Api.Category.Id[];
};

export const provideCategoryStoreInitialState = (state: CategoryState = {
  isInProgress: [],
  categoryList: [],
}): ValueProvider => {
  return {
    provide: PROJECT_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const CategoryStore = signalStore({
  providedIn: 'root',
}, 
withState<CategoryState>(() => {
  const initialState = inject(PROJECT_STORE_INITIAL_STATE);

  return initialState;
}),
withCategoryReducer(),
withCategoryApiEvents(),
withCategoryEvents(),
);
