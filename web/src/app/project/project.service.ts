import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { Store } from 'src/app/store';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private refreshList: Subject<void> = new Subject();

  constructor(private httpClient: HttpClient, private store: Store) {
    this.refreshList.subscribe({
      next: () => {
        this.listProjects();
      },
    });
  }

  listProjects_(): Observable<Project.Response[]> {
    return this.httpClient.get<Project.Response[]>(`${environment.apiUrl}${environment.projectStage}v1/projects`);
  }

  listProjects(): void {
    this.httpClient.get<Project.Response[]>(`${environment.apiUrl}${environment.projectStage}v1/projects`).subscribe({
      next: (value) => {
        this.store.projects.next(value);
      },
    });
  }

  createProject(body: Project.Request): void {
    this.httpClient.post<Project.ProjectId>(`${environment.apiUrl}${environment.projectStage}v1/projects`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateProject(projectId: Project.Id, body: Project.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteProject(projectId: Project.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeProjects(projectId: Project.Id, body: Project.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}/merge`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
