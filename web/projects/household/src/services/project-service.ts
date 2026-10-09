import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Service()
export class ProjectService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listProjects() {
    return this.httpClient.get<Responses.Project[]>(`${this.apiUrl}/project/v1/projects`);
  }
  
  createProject(body: Requests.Project) {
    return this.httpClient.post<Api.Project.ProjectId>(`${this.apiUrl}/project/v1/projects`, body);
  }
  
  updateProject(projectId: Api.Project.Id, body: Requests.Project) {
    return this.httpClient.put<void>(`${this.apiUrl}/project/v1/projects/${projectId}`, body);
  }
  
  deleteProject(projectId: Api.Project.Id) {
    return this.httpClient.delete<void>(`${this.apiUrl}/project/v1/projects/${projectId}`);
  }

  mergeProjects(projectId: Api.Project.Id, body: Api.Project.Id[]) {
    return this.httpClient.post<void>(`${this.apiUrl}/project/v1/projects/${projectId}/merge`, body);
  }
}
