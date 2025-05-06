import { Setting } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { settingApiActions } from '@household/web/state/setting/setting.actions';

export const settingReducer = createReducer<Setting.Response[]>(undefined,
  on(settingApiActions.listSettingsCompleted, (_state, { settings }) => {
    return settings;
  }),
);
