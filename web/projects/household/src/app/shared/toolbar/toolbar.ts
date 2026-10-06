import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainMenu } from '@household/app/shared/main-menu/main-menu';
import { AuthStore, ProgressStore } from '@household/shared-ui';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'household-toolbar',
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

  public authStore = inject(AuthStore);
  readonly progressStore = inject(ProgressStore);
}
