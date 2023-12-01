import { Component } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { ProjectService } from 'src/app/project/project.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  get projects(): Observable<Project.Response[]> {
    return this.store.projects.asObservable();
  }

  constructor(projectService: ProjectService, private store: Store) {
    projectService.listProjects();
  }
}
