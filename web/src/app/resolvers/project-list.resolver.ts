import { Injectable } from '@angular/core';
import {
  Resolve,
} from '@angular/router';
import { Project } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { ProjectService } from 'src/app/project/project.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectListResolver implements Resolve<Project.Response[]> {
  constructor(private projectService: ProjectService) { }

  resolve(): Observable<Project.Response[]> {
    return this.projectService.listProjects();
  }
}
