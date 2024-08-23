import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainMenuComponent } from 'src/app/shared/main-menu/main-menu.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';
import { selectIsInProgress } from 'src/app/state/progress/progress.selector';

@Component({
  selector: 'household-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
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

  constructor(private store: Store) { }
}
