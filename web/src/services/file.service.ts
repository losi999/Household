import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(private httpClient: HttpClient) { }

  createFileUploadUrl(request: File.Request) {
    return this.httpClient.post<File.FileId & File.Url>(`${environment.apiUrl}/file/v1/files`, request);
  }

  uploadFile(url: string, file: any) {
    return this.httpClient.put(url, file);
  }

  listFiles() {
    return this.httpClient.get<File.Response[]>(`${environment.apiUrl}/file/v1/files`);
  }

  deleteFile(fileId: File.Id) {
    return this.httpClient.delete(`${environment.apiUrl}/file/v1/files/${fileId}`);
  }
}
