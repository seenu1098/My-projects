import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../engine-module/shared/service/user-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../../shared-module/snackbar/snackbar.component';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { throwError } from 'rxjs';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    response: Observable<any>;
    constructor(private authenticationService: UserService, private router: Router
        , private snackBar: MatSnackBar, private workspaceService: WorkspaceService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(request).pipe(catchError(err => {
            if (err.error) {
                if (err.error.message && err.error.message !== 'No message available' && err.error.message !== 'Unauthorized'
                    && !err.error.message.includes('No grid list available')
                    && !err.error.message.includes('could not execute statement')
                    && !err.error.message.includes('SQLGrammarException')
                    && !err.error.message.includes('Internal error occured')
                    && !(err.error.errorMessage && !err.error.errorMessage.includes('BadCredentialsException: Bad credentials')
                        && !err.error.errorMessage.includes('NullPointerException:')
                        && !err.error.errorMessage.includes('IncorrectResultSizeDataAccessException:'))) {
                }
            }
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                localStorage.removeItem('token');
                this.authenticationService.logout();
                if (this.router.url !== '/login') {
                    // tslint:disable-next-line: deprecation
                    location.reload();
                }
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }));
    }
}
