import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectProjects } from '@household/web/state/project/project.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectListComponent } from '@household/web/app/project/project-list/project-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
  imports: [
    ToolbarComponent,
    MatIconModule,
    MatButtonModule,
    ProjectListComponent,
    AsyncPipe,
  ],
  selector: 'household-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss'],
})
export class ProjectHomeComponent implements OnInit {
  projects = this.store.select(selectProjects);

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(projectApiActions.listProjectsInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createProject());
  }
}
