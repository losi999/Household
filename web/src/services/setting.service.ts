import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Setting } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingService {

  constructor(private httpClient: HttpClient) { }

  listSettings() {
    return this.httpClient.get<Setting.Response[]>(`${environment.apiUrl}/setting/v1/settings`);
  }

  updateSetting(settingKey: Setting.Id, body: Setting.Request) {
    return this.httpClient.post(`${environment.apiUrl}/setting/v1/settings/${settingKey}`, body);
  }
}
