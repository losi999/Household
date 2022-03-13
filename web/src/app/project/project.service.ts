import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@household/shared/types/types';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private _projects = new BehaviorSubject<Project.Response[]>([]);

  get projects() {
    return this._projects.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listProjects(): void {
    this.httpClient.get<Project.Response[]>(`${environment.apiUrl}${environment.projectStage}v1/projects`)
      .subscribe(projects => this._projects.next(projects));
  }
}
