import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { ProgressService } from 'src/app/shared/progress.service';

@Component({
  selector: 'household-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'household';

  constructor(private progressService: ProgressService, private matIconReg: MatIconRegistry) { }

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }

  get isInProgress(): boolean {
    return this.progressService.isInProgress;
  }
}
