import { Component } from '@angular/core';
import { ProgressService } from 'src/app/shared/progress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'household';

  constructor(private progressService: ProgressService) { }

  get isInProgress(): boolean {
    return this.progressService.isInProgress;
  }
}
