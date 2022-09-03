import { Component, OnInit, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field, OptionsValue } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { LoadLogoService } from '../../service/load-logo.service';
import { SnackbarComponent } from '../../../../shared-module/snackbar/snackbar.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageService } from '../../service/page-service';

@Component({
    selector: 'app-image',
    template: `
    <ng-container *ngIf="showControl">
    <ng-container *ngIf="field.control && (field.control.image || field.name)
         && field.control.height">
         <div [style]="field.style" style="width:100%;margin-top:2%;">
         <ng-container *ngIf="onlyShow === true">
    <div style="font-weight:bold ;">{{field.label.labelName}}</div>
    </ng-container>
    <div *ngIf="isLoad && (field.control.imagePosition==='left'|| field.control.imagePosition==='right')" [style.background-color]="field.rowBackground">
    <img [src]="transform()" id="logo" class="logo" alt="YOROSIS LOGO" [style.width.px]="field.control.width"
      [style.height.px]="field.control.height" [style.float]="field.control.imagePosition">
  </div>

  <div *ngIf="isLoad && field.control.imagePosition==='center'" [style.background-color]="field.rowBackground">
    <img [src]="transform()" id="logo" class="logo" alt="YOROSIS LOGO" [style.width.px]="field.control.width"
      [style.height.px]="field.control.height" style="display: block;margin-left: auto; margin-right: auto;">
  </div>
  </div>
  </ng-container>
  </ng-container>
`,
    styles: []
})
export class ImageComponent implements OnInit {
    field: Field;
    group: FormGroup;
    pageIdentifier: string;
    showControl = true;
    previewUrl: any;
    isLoad = false;
    isRequired = false;
    onlyShow = false;
    isLoaded = false;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
    }

    constructor(public el: ElementRef, public formService: CreateFormService,
        public loadLogo: LoadLogoService, private sanitizer: DomSanitizer, public pageService: PageService,
        public activateRoute: ActivatedRoute, private cd: ChangeDetectorRef, public snackBar: MatSnackBar) { }
    ngOnInit() {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
        this.activateRoute.paramMap.subscribe(params => {
            if (params.get('id') !== null) {
                this.pageIdentifier = params.get('id');
            }
        });
        if (this.field.control.isDynamicImage && this.field.control.isDynamicImage === true) {
            this.onlyShow = true;
            this.formValueChanges();
            // this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
            // this.formService.checkConditionallyEnableValidation(this.field, this);
            // this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
            // this.formService.checkConditionallyShowValidation(this.field, this);
            // this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
        } else {
            this.loadImage();
        }
    }

    loadImage() {
        if (this.field.control && this.field.control.image) {
            this.previewUrl = this.field.control.image;
            this.isLoad = true;
            this.transform();
            this.cd.markForCheck();
        }
    }

    formValueChanges() {
        this.group.get(this.field.name).valueChanges.subscribe(data => {
            if (data !== null && data !== '' && !(data instanceof File)) {
                // for (let i = 0; i < data.length; i++) {
                //     if (this.urls.indexOf(data[i]) === -1) {
                //         this.urls = data;
                //     }
                // }
                if (!this.isLoaded) {
                    if (data.length > 0) {
                        this.loadImageFromMap(data[0]);
                    } else {
                        this.loadImageFromMap(data);
                    }
                }
            }
            this.group.markAsDirty();
        });
    }

    loadImageFromMap(imageKey) {
        const originalImageKey = imageKey.replace('thumbnail', '');
        this.isLoaded = true;
        this.pageService.getImageFromKey(originalImageKey).subscribe(images => {
            if (images) {
                // this.imageurl = images;
                const blob = new Blob([images], { type: 'image/jpeg' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = (event) => {
                    // this.imageurl = reader.result;
                    this.previewUrl = reader.result;
                    this.isLoad = true;
                    this.transform();
                    this.cd.markForCheck();
                };
                //   this.show = true;
            }
        },
            error => {
                // this.show = true;
                this.snackBar.openFromComponent(SnackbarComponent, {
                    data: 'Failed to load image.',
                });
            });
    }

    transform() {
        if (this.previewUrl !== null && this.previewUrl !== undefined) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
        }
    }
}
