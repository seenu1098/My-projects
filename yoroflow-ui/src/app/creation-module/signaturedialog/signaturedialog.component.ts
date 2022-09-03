import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Console } from 'console';
import { userSignatureListVO, userSignatureVO } from './signature-vo';
import { SignatureService } from './signature.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';

@Component({
  selector: 'app-signaturedialog',
  templateUrl: './signaturedialog.component.html',
  styleUrls: ['./signaturedialog.component.scss']
})
export class SignaturedialogComponent implements OnInit {
  signatureForm: FormGroup;
  signatureVO: userSignatureListVO;
  updateCustomerVo = new userSignatureListVO();
  dialogData: any;
  new: any;
  disable: boolean = false;
  show: boolean;
  allowSave = false;
  @ViewChild('signature', { static: false }) signaturePad: SignaturePad;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 1,
    'canvasHeight': 80,
    'backgroundColor': 'rgb(222, 224, 226)',
    'penColor': 'black'
  };
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SignaturedialogComponent>,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private signatureservice: SignatureService,
    private snackbar: MatSnackBar,
  ) { }
  ngOnInit(): void {

    this.signatureForm = this.formBuilder.group({
      name: ['', Validators.required],
      defaultSignature: ['']
    });
    if (this.data.type === 'edit') {
      this.signatureForm.get('name').setValue(this.data.val.signatureName)
      this.signatureForm.get('defaultSignature').setValue(this.data.val.defaultSignature)
    }
  }
  close() {
    this.dialogRef.close();
  }
  save() {
    const dataUrl = this.signaturePad.toDataURL('image/png', 0.5);
    const blob = this.dataURLToBlob(dataUrl);
    const name = this.signatureForm.get('name').value;
    const fileData = new File([blob], name);
    this.new = fileData
  }
  drawComplete() {
    this.save();
  }
  dataURLToBlob(dataURL) {
    const parts = dataURL.split(";base64,");
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: "image/png" });
  }
  saveSign(userForm) {
    if (this.signatureForm.valid && !this.signaturePad.isEmpty()) {
      this.disable = true;
      const formData = new FormData();
      this.signatureservice.addSign(this.getFile()).subscribe(res => {
        this.dialogData = res;
        if (res && res.response.includes('successfully')) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: res.response
          });
          this.dialogRef.close({ data: this.dialogData });
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: res.response
          });
          this.dialogRef.close(false);
        }
      })
    }
    else {
      this.disable = false;
    }
  }
  getFile() {
    const formData = new FormData();
    let signatureVO = new userSignatureVO();
    if (this.data.type === 'edit') {
      signatureVO.signatureId = this.data.val.signatureId
    }
    else {
      signatureVO.signatureId = null;
    }
    signatureVO.signatureName = this.signatureForm.get('name').value;
    signatureVO.defaultSignature = this.signatureForm.get('defaultSignature').value;
    formData.append('data', JSON.stringify(signatureVO));
    formData.append('files', this.new)
    return formData;
  }
  setDefault(event) {
    this.signatureForm.get('defaultSignature').setValue(event.checked)
  }

  saveUserSignature() {
    this.allowSave = true;
  }

  onNoClick() {
    this.dialogRef.close({ isSaved: false });
  }

  allowSaveUserSignature(userForm) {
    if (this.signatureForm.valid) {
      const blob = this.dataURLToBlob(this.data.urlValue);
      const name = this.signatureForm.get('name').value;
      const fileData = new File([blob], name);
      this.new = fileData;
      this.signatureservice.addSign(this.getFile()).subscribe(res => {
        this.dialogData = res;
        if (res) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: 'Signature saved successfully'
          });
          this.dialogRef.close({ isSaved: true, key: this.dialogData.signatureKey });
        }
      });
    }
  }
  clear() {
    this.signaturePad.clear();
  }
}
