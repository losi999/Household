import { Setting } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectSettings = createFeatureSelector<Setting.Response[]>('settings');

export const selectSettingByKey = (settingKey: string) => createSelector(selectSettings, (settings) => {
  return settings?.find(a => a.settingKey === settingKey);
});
