import { Component } from '@angular/core';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss'],
})
export class ProjectHomeComponent {

  constructor(private dialogService: DialogService) {
  }

  create() {
    this.dialogService.openCreateProjectDialog();
  }
}
