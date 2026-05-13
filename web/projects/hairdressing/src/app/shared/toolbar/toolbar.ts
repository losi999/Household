import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainMenu } from '@hairdressing/app/shared/main-menu/main-menu';
import { AuthService, ProgressStore } from '@household/shared-ui';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'hairdressing-toolbar',
  imports: [
    MatToolbarModule,
    MatProgressBarModule,
    MainMenu,
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Toolbar {
  title = input<string>();

  public authService = inject(AuthService);
  readonly progressStore = inject(ProgressStore);
}
