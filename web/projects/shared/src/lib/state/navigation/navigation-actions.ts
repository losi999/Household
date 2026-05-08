import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const navigationActions = createActionGroup({
  source: 'Navigation',
  events: {
    'Logged in homepage': emptyProps(),
    'Logged out homepage': emptyProps(),
    'Change calendar week': props<{
      year?: number;
      week?: number;
      weekOf?: string;
    }>(),
  },
});
