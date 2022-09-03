import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Section } from '../../vo/page-vo';

@Component({
    selector: 'app-collapsible-section',
    template: `
    <mat-expansion-panel  *ngIf="!section.repeatable" [expanded]="true" [style.box-shadow]="showBorder" style="margin-top:1%">
        <mat-expansion-panel-header>
             <mat-card-title>{{section.name}}</mat-card-title>
       </mat-expansion-panel-header>
        <app-dynamic-rows [group]="group" [rows]="section.rows"
             (getComponentFromRow)="getChipComponentInstance($event)">
        </app-dynamic-rows>
        <ng-container *ngIf="section.sections">
        <ng-container *ngFor="let section of section.sections">
            <app-dynamic-section [group]="group" [section]="section"
                (getChipComponent)="getChipComponentInstance($event)">
            </app-dynamic-section>
        </ng-container>
</ng-container>
    </mat-expansion-panel>
    <ng-container *ngIf="section.repeatable">
       <app-dynamic-rows [group]="group" [rows]="section.rows"
          (getComponentFromRow)="getChipComponentInstance($event)">
      </app-dynamic-rows>
    </ng-container>
          `,
    styles: []
})
export class DynamicCollapsibleSectionComponent implements OnInit {
    @Input() section: Section;
    @Input() group: FormGroup;
    @Output() getChipComponentFromSection: EventEmitter<any> = new EventEmitter<any>();
    showBorder: string;

    constructor() { }
    ngOnInit() {
        if (this.section.border === false) {
            this.showBorder = 'none';
        }
    }

    getChipComponentInstance($event) {
        this.getChipComponentFromSection.emit($event);
    }
}
