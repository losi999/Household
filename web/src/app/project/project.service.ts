import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

type ProjectCreated = {
  action: 'created';
  projectId: Project.Id;
  request: Project.Request;
};

type ProjectUpdated = {
  action: 'updated';
  projectId: Project.Id;
  request: Project.Request;
};

type ProjectDeleted = {
  action: 'deleted';
  projectId: Project.Id;
};

type ProjectsMerged = {
  action: 'merged';
  targetProjectId: Project.Id;
  sourceProjectIds: Project.Id[];
}
type ProjectEvent = ProjectCreated | ProjectUpdated | ProjectDeleted | ProjectsMerged;

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private _collectionUpdated: Subject<ProjectEvent> = new Subject();

  get collectionUpdated(): Observable<ProjectEvent> {
    return this._collectionUpdated.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listProjects(): Observable<Project.Response[]> {
    return this.httpClient.get<Project.Response[]>(`${environment.apiUrl}${environment.projectStage}v1/projects`);
  }

  createProject(body: Project.Request): void {
    this.httpClient.post<Project.ProjectId>(`${environment.apiUrl}${environment.projectStage}v1/projects`, body).subscribe({
      next: (value) => {
        this._collectionUpdated.next({
          action: 'created',
          projectId: value.projectId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateProject(projectId: Project.Id, body: Project.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'updated',
          projectId,
          request: body
        })
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteProject(projectId: Project.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'deleted',
          projectId
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeProjects(projectId: Project.Id, body: Project.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}/merge`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'merged',
          targetProjectId: projectId,
          sourceProjectIds: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
