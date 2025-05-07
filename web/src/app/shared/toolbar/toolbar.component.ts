import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainMenuComponent } from '@household/web/app/shared/main-menu/main-menu.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';
import { selectIsInProgress } from '@household/web/state/progress/progress.selector';
import { AuthService } from '@household/web/services/auth.service';

@Component({
  selector: 'household-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MainMenuComponent,
    MatProgressBarModule,
  ],
})
export class ToolbarComponent {
  @Input() title: string;

  isInProgress = this.store.select(selectIsInProgress);

  constructor(private store: Store, public authService: AuthService) { }
}
