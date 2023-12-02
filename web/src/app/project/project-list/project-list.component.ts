import { Component } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { ProjectService } from 'src/app/project/project.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  get projects(): Project.Response[] {
    return this.store.projects.value;
  }

  constructor(projectService: ProjectService, private store: Store) {
    projectService.listProjects();
  }
}
