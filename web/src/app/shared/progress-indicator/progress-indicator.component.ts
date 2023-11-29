import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  standalone: true,
  imports: [MatProgressSpinnerModule],
})
export class ProgressIndicatorComponent {

  constructor() { }
}
