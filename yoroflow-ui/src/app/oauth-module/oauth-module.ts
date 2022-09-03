import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage } from 'angular-oauth2-oidc';
import { YoroOAuthRoutingModule } from './oauth-routing.module';
import { YoroflowOAuthBeginComponent } from './oauth-begin.component';
import { YoroflowOAuthReturnComponent } from './oauth-return.component';

export function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  declarations: [YoroflowOAuthBeginComponent, YoroflowOAuthReturnComponent],
  imports: [CommonModule, YoroOAuthRoutingModule],
  providers: [
    { provide: OAuthStorage, useFactory: storageFactory },
  ],
})
export class YoroflowOAuthModule {
  constructor(@Optional() @SkipSelf() parentModule: YoroflowOAuthModule) {
    if (parentModule) {
      throw new Error(
        `OauthModule is already loaded. Import it in the AppModule only`
      );
    }
  }
}
