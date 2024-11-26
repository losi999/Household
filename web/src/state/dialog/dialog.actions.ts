import { Category, Project, Recipient } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const dialogActions = createActionGroup({
  source: 'Dialog',
  events: {
    'Create project': emptyProps(),
    'Update project': props<Project.Response>(),
    'Delete project': props<Project.Response>(),
    'Merge projects': props<Project.Response>(),
    'Create recipient': emptyProps(),
    'Update recipient': props<Recipient.Response>(),
    'Delete recipient': props<Recipient.Response>(),
    'Merge recipients': props<Recipient.Response>(),
    'Create category': emptyProps(),
    'Update category': props<Category.Response>(),
    'Delete category': props<Category.Response>(),
    'Merge categories': props<Category.Response>(),
  },
});
