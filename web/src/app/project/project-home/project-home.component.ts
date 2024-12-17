import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectProjects } from '@household/web/state/project/project.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss'],
  standalone: false,
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
