import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ProjectService } from 'src/app/project/project.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { projectApiActions } from 'src/app/project/project.actions';
import { selectProjects } from 'src/app/project/project.selector';

@Component({
  selector: 'household-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss'],
})
export class ProjectHomeComponent implements OnInit {
  projects = this.store.select(selectProjects);

  constructor(private dialogService: DialogService, private projectService: ProjectService, private store: Store) {
  }

  ngOnInit(): void {
    this.projectService.listProjects_().subscribe((projects) => {
      this.store.dispatch(projectApiActions.retrievedProjectList({
        projects,
      }));
    });
  }

  create() {
    this.dialogService.openCreateProjectDialog();
  }
}
