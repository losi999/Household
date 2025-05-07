import { createActionGroup, emptyProps } from '@ngrx/store';

export const navigationActions = createActionGroup({
  source: 'Navigation',
  events: {
    'Logged in homepage': emptyProps(),
    'Logged out homepage': emptyProps(),
  },
});
