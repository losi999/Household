import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'shared-icon-text',
  imports: [MatIconModule],
  templateUrl: './icon-text.html',
  styleUrl: './icon-text.scss',
})
export class IconText {
  icon = input.required<string>();
  text = input.required<string>();
  textStyle = input<'bold' | 'italic' | null>(null);
  rowColor = input<'red' | 'green' | null>(null);
  size = input<'small' | 'medium' | 'large'>('small');

}
