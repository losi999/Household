import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainMenu } from '@hairdressing/app/shared/main-menu/main-menu';
import { AuthService } from '@household/shared-ui';

@Component({
  selector: 'hairdressing-toolbar',
  imports: [
    MatToolbarModule,
    MainMenu,
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Toolbar {
  title = input<string>();

  public authService = inject(AuthService);
}
