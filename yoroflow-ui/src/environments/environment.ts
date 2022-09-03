// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseurl: 'workflow-service',
  workflowBaseurl: 'workflow-service',
  renderingBaseUrl: 'rendering-service',
  creationBaseUrl: 'creation-service',
  siteKeyProdUrl: '6Lfz7KIZAAAAADsdIjUtNlyn0N0oquXMKvJH1IPL',
  siteKeyLocalUrl: '6LcP16IZAAAAAIEG1a0HScgb-AMJ16zfyBTwv1oW',
  authUrl: 'authnz-service',
  messagingBaseUrl: 'messaging-service',
  automationBaseUrl: 'automation-service',
  externalProvidersIntegrationUrl: `${window.location.origin}/single-signon`,
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
