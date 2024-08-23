import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  constructor(private httpClient: HttpClient) { }

  listProjects() {
    return this.httpClient.get<Project.Response[]>(`${environment.apiUrl}${environment.projectStage}v1/projects`);
  }

  createProject(body: Project.Request) {
    return this.httpClient.post<Project.ProjectId>(`${environment.apiUrl}${environment.projectStage}v1/projects`, body);
  }

  updateProject(projectId: Project.Id, body: Project.Request) {
    return this.httpClient.put<Project.ProjectId>(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`, body);
  }

  deleteProject(projectId: Project.Id) {
    return this.httpClient.delete(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`);
  }

  mergeProjects(projectId: Project.Id, body: Project.Id[]) {
    return this.httpClient.post(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}/merge`, body);
  }
}
