import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { SettingService } from '@household/web/services/setting.service';
import { settingApiActions } from '@household/web/state/setting/setting.actions';

@Injectable()
export class SettingEffects {
  constructor(private actions: Actions, private settingService: SettingService) {}

  loadSettings = createEffect(() => {
    return this.actions.pipe(
      ofType(settingApiActions.listSettingsInitiated),
      exhaustMap(() => {
        return this.settingService.listSettings().pipe(
          map((settings) => settingApiActions.listSettingsCompleted({
            settings,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  updateSetting = createEffect(() => {
    return this.actions.pipe(
      ofType(settingApiActions.updateSettingInitiated),
      groupBy(({ settingKey }) => settingKey),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ settingKey, value }) => {
          return this.settingService.updateSetting(settingKey, {
            value,
          }).pipe(
            map(() => settingApiActions.updateSettingCompleted({
              settingKey,
            })),
            catchError(() => {
              const errorMessage = 'Hiba történt';
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: errorMessage,
                }),
              );
            }),
          );
        }));
      }),
    );
  });
}

