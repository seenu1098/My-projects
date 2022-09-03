import { Component, OnInit, EventEmitter, Input, Output, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Section } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';


@Component({
    selector: 'app-card-section',
    template: `
        <mat-card style="margin-top: 2%;" [style.box-shadow]="showBorder" *ngIf="!section.repeatable && showSection" style="margin-top:2%" [style]="section.style">
        <mat-card-title>{{section.name}}</mat-card-title>
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
        </mat-card>
        <ng-container *ngIf="section.repeatable === true">
           <app-dynamic-rows [group]="group" [rows]="section.rows"
               (getComponentFromRow)="getChipComponentInstance($event)">
           </app-dynamic-rows>
        </ng-container>
          `,
    styles: []
})
export class DynamicCardSectionComponent implements OnInit {
    @Input() section: Section;
    @Input() group: FormGroup;
    @Output() getChipComponentFromSection: EventEmitter<any> = new EventEmitter<any>();
    showSection = true;
    showBorder: string;

    constructor(public formService: CreateFormService, public el: ElementRef) { }
    ngOnInit() {
        this.formService.checkSectionsForCondtionalValidations(this.group, this.section, this);
        if (this.section.border === false) {
            this.showBorder = 'none';
        }
    }

    getChipComponentInstance($event) {
        this.getChipComponentFromSection.emit($event);
    }
}
