import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'household-icon-text',
  imports: [
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './icon-text.component.html',
  styleUrl: './icon-text.component.scss',
})
export class IconTextComponent {
  @Input() icon: string;
  @Input() text: string;
  @Input() textStyle: 'bold' | 'italic';
  @Input() rowColor: 'red' | 'green';
  @Input() size: 'small' | 'medium' | 'large' = 'small';
}
