import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, pipe, of } from 'rxjs';
import { finalize, delay } from 'rxjs/operators';
import { LoaderService } from './loader.service';
import { error } from 'util';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const loaderService = this.injector.get(LoaderService);
    loaderService.show();

    return next.handle(req).pipe(
      finalize(() => loaderService.hide())
    );
  }
  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401) {
      return of(err.message);
    }
    throw error;
  }
}


