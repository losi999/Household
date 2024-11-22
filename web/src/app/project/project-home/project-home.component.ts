import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectProjects } from '@household/web/state/project/project.selector';

@Component({
  selector: 'household-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss'],
  standalone: false,
})
export class ProjectHomeComponent implements OnInit {
  projects = this.store.select(selectProjects);

  constructor(private dialogService: DialogService, private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(projectApiActions.listProjectsInitiated());
  }

  create() {
    this.dialogService.openCreateProjectDialog();
  }
}
