import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const selectionEvents = eventGroup({
  source: 'Selection',
  events: {
    itemSelected: type<{
      selectionId: string;
      item: object;
    }>(),
  },
});
