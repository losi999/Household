import { Component, inject } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectStore } from '@household/state/project/project-store';
import { projectApiEvents, projectEvents } from '@household/state/project/project-events';
import { injectDispatch } from '@ngrx/signals/events';
import { ProjectList } from '@household/app/project/project-list/project-list';

@Component({
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    ProjectList,
  ],
  selector: 'household-project-home',
  styleUrl: './project-home.scss',
  templateUrl: './project-home.html',
})
export class ProjectHome {
  readonly projectStore = inject(ProjectStore);
  private readonly projectApiEvents = injectDispatch(projectApiEvents);
  private readonly projectEvents = injectDispatch(projectEvents);

  constructor() {
    this.projectApiEvents.listProjectsInitiated();
  }

  create() {
    this.projectEvents.createProject();
  }
}
