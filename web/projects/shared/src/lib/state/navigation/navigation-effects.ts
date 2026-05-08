import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { authActions, navigationActions } from '@household/shared-ui';

@Injectable()
export class NavigationEffects {
  private actions = inject(Actions);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  changeCalendarWeek = createEffect(() => {
    return this.actions.pipe(
      ofType(navigationActions.changeCalendarWeek),
      tap(({ type, ...params }) => {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: params,
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });

  navigateToLoggedInHomepage = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logInCompleted, navigationActions.loggedInHomepage),
      tap(() => {
        this.router.navigate(['/'], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });

  loggedOut = createEffect(() => {
    return this.actions.pipe(
      ofType(authActions.logOut, navigationActions.loggedOutHomepage),
      tap(() => {
        this.router.navigate([
          '/',
          'login',
        ], {
          replaceUrl: true,
        });
      }),
    );
  }, {
    dispatch: false,
  });
}

