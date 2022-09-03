import { OnInit, Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Field } from '../../vo/page-vo';
import { FormGroup } from '@angular/forms';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { Observable, Observer } from 'rxjs';
import { PageService } from '../../service/page-service';
import { SignaturedialogComponent } from 'src/app/creation-module/signaturedialog/signaturedialog.component';
import { MatDialog } from '@angular/material/dialog';
// import {File, IWriteOptions, FileEntry} from '@ionic-native/file/ngx';
@Component({
    selector: 'app-signature',
    templateUrl: 'signature.component.html',
    styleUrls: ['./signature.component.css']
})
export class SignatureComponent implements OnInit {
    constructor(public el: ElementRef, public formService: CreateFormService,
                private dialog: MatDialog, public pageService: PageService, public loadValue: LoadFormService) { }
    @ViewChild('signature', { static: true }) signaturePad: SignaturePad;
    @ViewChild('menuTrigger4') signatureMenu;

    // tslint:disable-next-line:ban-types
    signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        minWidth: 1,
        canvasHeight: 70,
        backgroundColor: 'rgb(222, 224, 226)',
        penColor: 'black'
    };
    field: Field;
    group: FormGroup;
    isLoad = true;
    showControl = true;
    isRequired = true;
    fileData: File;
    previewUrl: any;
    res: any;
    checked = false;
    signatureList: any[] = [];
    defaultSignature: any;
    selectedSignatureKey: any;
    isChanged = false;
    drawCompleted = false;
    signatureWidth = '10px';
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
        this.loadSignatures();
        this.loadFormValues();
        // if (this.group.get(this.field.name).value !== null) {
        //     this.loadSignature(this.group.get(this.field.name).value);
        // }
        this.signatureWidth = (7.5 * this.field.fieldWidth) + 'px';
    }

    loadFormValues() {
        this.group.get(this.field.name).valueChanges.subscribe(data => {
            if (data) {
                this.loadSignature(data);
            } else {
                this.signaturePad.clear();

            }
        }
        );
    }
    // tslint:disable-next-line:use-lifecycle-interface
    ngAfterViewInit() {
        // this.signaturePad is now available
        this.signaturePad.set('minWidth', 1); // set szimek/signature_pad options at runtime
        this.signaturePad.set('canvasWidth', 7.5 * this.field.fieldWidth); // invoke functions from szimek/signature_pad API
        this.signaturePad.clear();
        if (this.group.get(this.field.name).status === 'DISABLED') {
            this.signaturePad.off();
        } else {
            this.signaturePad.on();
        }
        if (this.group.get(this.field.name).value !== null) {
            this.loadSignature(this.group.get(this.field.name).value);
        }
        this.signatureWidth = (7.5 * this.field.fieldWidth) + 'px';
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        this.drawCompleted = true;
        this.group.get(this.field.name).setValue(this.signaturePad.toDataURL('image/png', 0.8), { emitEvent: false });
        this.isChanged = true;
    }

    save() {
        const dataUrl = this.signaturePad.toDataURL('image/png', 0.8);
        this.drawCompleted = false;
        if (dataUrl) {
            if (this.signatureList !== undefined && this.signatureList.length < 3) {
                const dialog = this.dialog.open(SignaturedialogComponent, {
                    disableClose: true,
                    width: '500px',
                    data: { type: 'signature-control', urlValue: dataUrl }
                });
                dialog.afterClosed().subscribe(data => {
                    if (data.isSaved === true) {
                        this.group.get(this.field.name).setValue(data.key);
                        this.isRequired = false;
                        this.isChanged = true;
                        this.loadSignatures();
                        this.getSignatureByKey(data.key);
                    } else {
                        this.setSignatureValue(dataUrl);
                    }
                });
            } else {
                this.setSignatureValue(dataUrl);
            }
        }
    }

    setSignatureValue(dataUrl) {
        this.group.get(this.field.name).setValue(dataUrl, { emitEvent: false });
        this.isRequired = false;
        this.isChanged = true;
        this.drawCompleted = false;
    }

    saveUserSignature(data) {
        this.group.get(this.field.name).setValue(data);
        this.selectedSignatureKey = data;
        this.isRequired = false;
        this.isChanged = true;
        this.signatureMenu.closeMenu();
        this.drawCompleted = false;
    }

    loadSignatures() {
        this.pageService.getSignatureList().subscribe(data => {
            if (data) {
                this.signatureList = data;
                this.getDefaultSignature();
            }
        });
    }

    getDefaultSignature() {
        const index = this.signatureList.findIndex(signature =>
            signature.defaultSignature === true
        );
        if (index !== -1) {
            this.defaultSignature = this.signatureList[index];
        }
    }

    addDefaultSignature(event) {
        if (event.checked === true) {
            this.checked = true;
            this.getSignatureByKey(this.defaultSignature.signatureKey);
            this.saveUserSignature(this.defaultSignature.signatureKey);
        } else {
            this.checked = false;
            this.clear();
        }
    }

    loadSignature(data) {
        if (data.includes('data:image/png')) {
            this.signaturePad.fromDataURL(this.group.get(this.field.name).value,
                { width: 7.5 * this.field.fieldWidth, height: 70 });
        } else {
            this.getSignatureByKey(data);
        }
    }

    getSignatureByKey(key) {
        this.pageService.getImageFromKey(key).subscribe(image => {
            this.selectedSignatureKey = key;
            const blob = new Blob([image], { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = (event) => {
                this.signaturePad.fromDataURL(event.target.result.toString(),
                    { width: 7.5 * this.field.fieldWidth, height: 70 });
            };
        });
    }

    disablePad() {
        if (this.group.get(this.field.name).status === 'DISABLED') {
            this.signaturePad.off();
        } else {
            this.signaturePad.on();
        }
    }

    drawStart() {
        // will be notified of szimek/signature_pad's onBegin event
        this.isRequired = false;
    }

    clear() {
        this.signaturePad.clear();
        this.group.get(this.field.name).setValue(null);
        this.isRequired = true;
        this.isChanged = true;
    }
}
