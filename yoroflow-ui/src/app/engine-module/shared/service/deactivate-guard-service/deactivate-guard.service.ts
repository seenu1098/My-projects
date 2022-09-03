import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}
@Injectable({
  providedIn: 'root'
})

export class DeactivateGuardService implements CanDeactivate<CanComponentDeactivate>{

  constructor() { }

  canDeactivate(component: CanComponentDeactivate, 
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot) {
      return component.canDeactivate ? component.canDeactivate() : true;
    }
}
