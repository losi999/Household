import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainMenuComponent } from 'src/app/shared/main-menu/main-menu.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MainMenuComponent,
  ],
})
export class ToolbarComponent {
  @Input() title: string;
  constructor() { }
}
