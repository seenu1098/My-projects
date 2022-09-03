import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from 'inspector';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private injector: Injector, private router: Router, private workspaceService: WorkspaceService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = localStorage.getItem('token'); 
        if (currentUser) {
            request = request.clone({
                setHeaders: {
                    Authorization: currentUser
                }
            });
        }
        return next.handle(request);
    }
}
