import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './authentication/auth-guard-service/auth.guard';
import { CanDeactivateGuard } from './authentication/authentication.guard.deactivate';
import { ErrorInterceptor } from './http/error-interceptor';

@NgModule({
  imports: [CommonModule, RouterModule],
  providers: [
    AuthGuard,
    CanDeactivateGuard,
    ErrorInterceptor
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Import guard
    if (parentModule) {
      throw new Error(
        `${parentModule} has already been loaded. Import Core module in the AppModule only.`
      );
    }
  }
}
