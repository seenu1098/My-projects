import { Injector, NgModule } from '@angular/core';
import { MessageNotificationComponent } from './message-notification.component';
import { MessagePassingComponent } from './message-passing/message-passing.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NotificationComponent } from './notification/notification.component';
import { MessageComponent } from './message/message.component';
import { MessagesDialogBoxComponent } from './messages-dialog-box/messages-dialog-box.component';
import { NotificationsDialogBoxComponent } from './notifications-dialog-box/notifications-dialog-box.component';
import { MessageNotificationRoutingModule } from './message-notification-routing.module';
import { MaterialElevationDirective } from './material-elevation';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { ThyButtonModule } from 'ngx-tethys/button';
import { SharedModule } from '../shared-module/shared.module';
import { NotificationPageComponent } from './notification-page/notification-page.component';

export let InjectorInstance: Injector;


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  declarations: [MessageNotificationComponent,
    ConfirmationDialogComponent, MessagePassingComponent, NotificationComponent, MessageComponent,
    MessagesDialogBoxComponent,
    NotificationsDialogBoxComponent,
    MaterialElevationDirective,
    NotificationPageComponent,
    ],
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    FlexLayoutModule,
    MessageNotificationRoutingModule,
    PerfectScrollbarModule,
    ThyButtonModule,
    SharedModule
  ],
  exports: [MessageNotificationComponent, MessageComponent, MessagesDialogBoxComponent,
    ConfirmationDialogComponent, MessagePassingComponent, NotificationComponent, NotificationsDialogBoxComponent],
  entryComponents: [ConfirmationDialogComponent, MessagesDialogBoxComponent, NotificationsDialogBoxComponent],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ]
})
export class MessageNotificationModule {
  constructor(private injector: Injector) 
  {
    InjectorInstance = this.injector;
  }
 }
