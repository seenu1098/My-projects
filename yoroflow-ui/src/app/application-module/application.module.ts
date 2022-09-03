import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateApplicationComponent } from './create-application/create-application.component';
import { ApplicationTemplatesComponent } from './application-templates/application-templates.component';
import { MaterialElevationDirective } from './material-elevation';
import { SharedModule } from '../shared-module/shared.module';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ApplicationRoutingModule } from './application-routing.module';



@NgModule({
  declarations: [
    CreateApplicationComponent,
    ApplicationTemplatesComponent,
    MaterialElevationDirective
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule, 
    FormsModule,
    PerfectScrollbarModule,
    FlexLayoutModule,
    ApplicationRoutingModule
  ]
})
export class ApplicationModule { }
