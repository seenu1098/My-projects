import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private injector: Injector, private jwtHelper: JwtHelperService, private router: Router) { }

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
