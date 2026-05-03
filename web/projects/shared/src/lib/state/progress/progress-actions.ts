import { createActionGroup, emptyProps } from '@ngrx/store';

export const progressActions = createActionGroup({
  source: 'Progress',
  events: {
    'Process started': emptyProps(),
    'Process finished': emptyProps(),
  },
});

