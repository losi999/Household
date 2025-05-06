import { Setting } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const settingApiActions = createActionGroup({
  source: 'Setting API',
  events: {
    'List settings initiated': emptyProps(),
    'List settings completed': props<{settings: Setting.Response[]}>(),
    'Update setting initiated': props<Setting.SettingKey & Setting.Request>(),
    'Update setting completed': props<Setting.SettingKey>(),
  },
});
