import { createReducer, on } from '@ngrx/store';
import { categoryApiActions } from 'src/app/category/category.actions';

export const categoryReducer = createReducer([],
  on(categoryApiActions.retrievedCategoryList, (_state, { categories }) => {
    return categories;
  }),
);
