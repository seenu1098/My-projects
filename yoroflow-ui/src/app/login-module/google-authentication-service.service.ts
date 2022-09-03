import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthenticationServiceService {
  authInstance: gapi.auth2.GoogleAuth;
  private subject = new ReplaySubject<gapi.auth2.GoogleUser>(1);
  constructor() {
    window['googleSDKLoaded'] = () => {
      window['gapi'].load('auth2', () => {
        this.authInstance = window['gapi'].auth2.init({
       client_id: '548004574948-4diddp336svf9e79nqoo6i2sr2g1gahj.apps.googleusercontent.com'
});
      });
    }
   
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'google-jssdk'));

   }

   public signIn() {
     this.authInstance.signIn({
       
     }).then(user => {
       this.subject.next(user);
     }).catch( (error) => {
      this.subject.next(null);
     });
   }

   public getSignInDetails(): Observable<gapi.auth2.GoogleUser> {
     return this.subject.asObservable();
   }
}
