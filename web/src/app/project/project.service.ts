import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private _refreshList: Subject<void> = new Subject();

  get refreshList(): Observable<void> {
    return this._refreshList.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listProjects(): Observable<Project.Response[]> {
    return this.httpClient.get<Project.Response[]>(`${environment.apiUrl}${environment.projectStage}v1/projects`);
  }

  createProject(body: Project.Request): void {
    this.httpClient.post(`${environment.apiUrl}${environment.projectStage}v1/projects`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateProject(projectId: Project.IdType, body: Project.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteProject(projectId: Project.IdType): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.projectStage}v1/projects/${projectId}`).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
