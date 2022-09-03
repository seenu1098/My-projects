import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { Field } from '../../vo/page-vo';
import { FormGroup } from '@angular/forms';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
    selector: 'app-export-to-pdf',
    template: `
    <div [style]="field.style" style="width:100%">
            <ng-container [style.background-color]="field.rowBackground">
            <button mat-raised-button color="primary" id="button" (click) = "generate()" type="button">{{field.label.labelName}}
            </button>
            </ng-container>
            </div>
            `,
    styles: []
})
export class ExportToPdfComponent implements OnInit {
    @Input() field: Field;
    @Input() group: FormGroup;
    constructor(public el: ElementRef, public formService: CreateFormService) { }
    formValues: any;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
    }
    ngOnInit() {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
        this.group.removeControl(undefined);
        if (this.field.name) {
            this.group.removeControl(this.field.name);
        }
    }
    generate() {
        if (this.group.valid) {
            this.formValues = this.group.value;

            // this.accountBillService.pdfResponse(this.formValues).subscribe((response) => {
            //     const blob = new Blob([response], { type: response.type });
            //     saveAs(blob, this.patientName);
            // }
            // );
        }
    }
}
