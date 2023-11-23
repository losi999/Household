import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProgressService } from 'src/app/shared/progress.service';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {
  constructor(private progressService: ProgressService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          this.progressService.processFinished();
        }
        else {
          this.progressService.processStarted();
        }
      }
    }));
  }
}
