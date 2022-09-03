import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Placeholder } from './placeholder-vo';

@Component({
    selector: 'app-yoroflow-chip',
    template: `<ng-container>
                <mat-form-field  style="width: 100%; margin-top: 2px" [formGroup]="data.group">
                    <mat-chip-list #chiplist>
                        <mat-chip *ngFor="let holder of placeholder" [selectable]="selectable"
                            [removable]="removable" (removed)="removeItemsFromChipList(holder)">
                            {{holder.name}}
                            <mat-icon matChipRemove *ngIf="removable">close
                            </mat-icon>
                        </mat-chip>
                        <input id="chip" type="text" [placeholder]="data.label" [id]="data.name"
                            [matChipInputFor]="chiplist" [formControlName]="data.name"
                            [matChipInputSeparatorKeyCodes]="separatorKeysCodes" [matChipInputAddOnBlur]="addOnBlur"
                            (matChipInputTokenEnd)="addItemsToChipList($event)">
                    </mat-chip-list>
                   </mat-form-field>
                   <mat-error *ngIf="(data.group.get(this.data.name).errors?.pattern||data.group.get(this.data.name).errors?.email)
                   && showError">Please enter a valid email</mat-error>
               </ng-container>
`,
    styles: []
})
export class YoroFLowChipComponent implements OnInit {

    @Input() data: any;
    @Output() chip = new EventEmitter<object>();

    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    placeholder: Placeholder[] = [];
    showError = false;

    constructor(private el: ElementRef) { }
    ngOnInit() {
        this.el.nativeElement.style.width = 100 + '%';
        this.chip.emit(this);
    }

    addItemsToChipList(event) {
        this.addData(event, this.placeholder);
    }

    removeItemsFromChipList(holder: Placeholder) {
        this.removeData(holder, this.placeholder);
    }

    addData(event: MatChipInputEvent, list: Placeholder[]) {
        const input = event.input;
        const value = event.value;
        if (!this.data.group.get(this.data.name).errors || (!this.data.group.get(this.data.name).errors.email
        && !this.data.group.get(this.data.name).errors.pattern)) {
            this.showError = false;
            if ((value || '').trim()) {
                list.push({ name: value.trim() });
            }
            // Reset the input value
            if (input) {
                input.value = '';
            }
        } else if (this.data.group.get(this.data.name).errors && this.data.group.get(this.data.name).errors.email) {
            this.data.group.get(this.data.name).markAsTouched({ onlySelf: true });
            this.showError = true;
        }
    }

    removeData(placeholder: Placeholder, list: Placeholder[]): void {
        const index = list.indexOf(placeholder);
        if (index >= 0) {
            list.splice(index, 1);
        }
        if (this.placeholder.length === 0) {
            this.data.group.get(this.data.name).setValue(null);
            this.data.group.get(this.data.name).setErrors({ chip: true });
        }
    }

    getPlaceholderFromStringArray(values: string[]): Placeholder[] {
        const output = [];
        if (values && values.length > 0) {
            values.forEach(token => output.push({ name: token }));
        }
        return output;
    }

    getListFromPlaceHolder(list: Placeholder[]): string[] {
        const values = [];
        list.forEach(placeholder => values.push(placeholder.name));
        return values;
    }

    getPlaceholderFromStringArrayForExpectedElements(values: string[], name: string): Placeholder[] {
        const output = [];
        if (values && values.length > 0) {
            values.forEach(token => output.push({ name: token, fieldName: name }));
        }
        return output;
    }
}