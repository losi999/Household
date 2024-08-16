import { Category } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const categoryApiActions = createActionGroup({
  source: 'Category API',
  events: {
    'Retrieved category list': props<{categories: Category.Response[]}>(),
  },
});
