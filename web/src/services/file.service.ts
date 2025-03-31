import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(private httpClient: HttpClient) { }

  createFileUploadUrl() {
    return this.httpClient.post<File.FileId & File.Url>(`${environment.apiUrl}file/v1/files`, {
      fileType: 'otp',
      timezone: 'Europe/Budapest',
    });
  }
}
