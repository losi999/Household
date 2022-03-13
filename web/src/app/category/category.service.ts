import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private _categories = new BehaviorSubject<Category.Response[]>([]);

  get categories() {
    return this._categories.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listCategories(): void {
    this.httpClient.get<Category.Response[]>(`${environment.apiUrl}${environment.categoryStage}v1/categories`)
      .subscribe(categories => this._categories.next(categories));
  }
}
