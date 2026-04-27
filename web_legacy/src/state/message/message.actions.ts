import { createActionGroup, emptyProps } from '@ngrx/store';

export const messageActions = createActionGroup({
  source: 'Message',
  events: {
    'Submit transaction edit form': emptyProps(),
  },
});
