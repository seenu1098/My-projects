import { Injectable, Injector, Inject } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from '../service/form-service/loader-service';
import { tap, finalize, delay } from 'rxjs/operators';
import { SnackbarComponent } from '../../../shared-module/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import decode from 'jwt-decode';


@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    constructor(private injector: Injector, private snackBar: MatSnackBar, private router: Router) { }

    intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
        const loaderService = this.injector.get(LoaderService);
        loaderService.show();
        return handler.handle(req).pipe(
            tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    loaderService.hide();
                }
            }, (error: any) => {
                if (error instanceof HttpErrorResponse) {
                    if (error.error
                        && (!error.error.errorMessage.includes('BadCredentialsException: Bad credentials')
                            && !error.error.errorMessage.includes('NullPointerException:')
                            && !error.error.errorMessage.includes('IncorrectResultSizeDataAccessException:')
                            && !error.error.errorMessage.includes('YorosisException:'))) {
                        // this.snackBar.openFromComponent(SnackbarComponent, {
                        //     data: 'Internal server error',
                        // });
                    }
                    loaderService.hide();
                }
                loaderService.hide();
            }));
    }
}
