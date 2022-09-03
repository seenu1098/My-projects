import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Field, ImageKeysVO, OptionsValue, Page } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { LoadLogoService } from '../../service/load-logo.service';
import { SnackbarComponent } from '../../../../shared-module/snackbar/snackbar.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { ButtonComponent } from '../button/button.component';
import { PageService } from '../../service/page-service';
import { MatDialog } from '@angular/material/dialog';
import { UppyComponentComponent } from 'src/app/shared-module/uppy-component/uppy-component.component';
import * as FileSaver from 'file-saver';
import { RenderingConfirmDialogBoxComponent } from 'src/app/rendering-module/rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';

export class FilesVO {
    fileName: string;
    filePath: string;
}

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
    field: Field;
    group: FormGroup;
    page: Page;
    pageIdentifier: string;
    showControl = true;
    uploadAction = 'upload';
    allowToSubmit = false;
    previewUrl: any;
    fileData: File[] = [];
    base64Image: any;
    isLoad = false;
    fileName: string;
    fileList: any[] = [];
    urls: any[] = [];
    deletedURls: any[] = [];
    replaceImageKeys: string[] = [];
    resetFile = false;
    imagesList: any[] = [];
    onlyShow = false;
    isRequired = false;
    uploadFiles: FilesVO[] = [];
    isUpload: boolean = false;
    removedFiles: any[] = [];
    preview: boolean = false;
    showError: boolean = false;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 850) {
            this.el.nativeElement.style.width = '100%';
        } else {
            this.el.nativeElement.style.width = this.field.fieldWidth + '%';
        }
    }
    @ViewChild('fileInput') fileInput;
    constructor(public el: ElementRef, public loadLogo: LoadLogoService, private sanitizer: DomSanitizer,
        public activateRoute: ActivatedRoute, private snackBar: MatSnackBar, private loadFormService: LoadFormService,
        private pageService: PageService, public formService: CreateFormService, private dialog: MatDialog, private fb: FormBuilder) { }
    ngOnInit() {
        this.group.addControl('removedFiles', this.fb.control(''));
        if (this.group.get('preview') && this.group.get('preview').value !== undefined
            && this.group.get('preview').value !== null && this.group.get('preview').value === true) {
            this.preview = true;
        }
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

        this.loadFormService.resetEmitter.subscribe(data => {
            if (data) {
                this.urls = [];
                this.fileData = [];
                this.fileList = [];
                this.replaceImageKeys = [];
                this.imagesList = [];
                this.group.get(this.field.name).setValue(null);
                this.resetFile = true;
            }
        });
        if (this.field.control.isDynamicFile && this.field.control.isDynamicFile === true) {
            this.onlyShow = true;
        }
        this.formValueChanges();
        // this.previewUrl = this.loadLogo.previewUrl;

        // this.loadFormService.updateList.subscribe(data => {
        //     this.urls = [];
        //     if (data.data && this.field.control.fileType === 'image') {
        //         this.urls = data.files;
        //         this.group.get(this.field.name).setValue(data.files);
        //     }
        // })
        // if (!this.group.get('isTaskboard') && this.group.get(this.field.name).value !== null
        //     && this.group.get(this.field.name).value.length > 0) {
        //     this.loadGridImages();
        // }
        if (this.group.get(this.field.name) && this.group.get(this.field.name).value && this.isUpload === false) {
            this.uploadFiles = this.group.get(this.field.name).value;
        }
        if (this.field.validations) {
            this.isRequired = this.formService.getIsRequiredValue(this.field.validations);
        }
        this.formService.addConditonallyRequiredValidation(this.field, this, this.isRequired);
        this.formService.checkConditionallyEnableValidation(this.field, this);
        // this.formService.addCondtionallyEnabledFormValueChanges(this.field, this);
        this.formService.checkConditionallyShowValidation(this.field, this);
        this.formService.addContionallyShowValidationValueChanges(this.field, this, this.group);
    }

    removeImage(url) {
        const index = this.urls.indexOf(url);
        this.deletedURls.push(url);
        this.urls.splice(index, 1);
        this.group.get(this.field.name).setValue(this.urls, { emitEvent: false });
    }


    formValueChanges() {
        this.group.get(this.field.name).valueChanges.subscribe(data => {
            if (data !== null && data.length > 0 && !(data instanceof File)) {
                this.urls = [];
                this.fileData = [];
                this.fileList = [];
                this.replaceImageKeys = [];
                this.imagesList = [];
                if (this.group.get(this.field.name) && this.group.get(this.field.name).value && this.isUpload === false) {
                    this.uploadFiles = this.group.get(this.field.name).value;
                }
                // this.group.get(this.field.name).setValue(null);
                // this.resetFile = true;
                // this.loadGridImages();
                // for (let i = 0; i < data.length; i++) {
                //     if (this.urls.indexOf(data[i]) === -1) {
                //         this.urls = data;
                //     }
                // }
                this.isLoad = true;
            } else {
                this.isLoad = false;
            }
            this.group.markAsDirty();
        });
    }

    onFileInput($event) {
        if ($event) {
            // if ($event.target.files[0].type.includes('image/')) {
            //     this.fileProgress($event);
            // } else {
            //     this.snackBar.openFromComponent(SnackbarComponent, {
            //         data: 'Please choose Image File',
            //     });
            // }
            let files = $event.target.files;
            if (files) {
                for (let file of files) {
                    this.fileData.push(file);
                }
                this.setFileTypeAndName(this.fileData);
            }
        }
    }

    setFileTypeAndName(fileData) {
        for (let i = 0; i < fileData.length; i++) {
            let reader = new FileReader();
            reader.readAsDataURL(fileData[i]);
            if ((this.fileData[i].size) / 1024 < this.field.control.fileSize) {
                reader.onload = (event: any) => {
                    if (this.urls.indexOf(event.target.result) === -1
                        && this.deletedURls.indexOf(event.target.result) === -1) {
                        this.urls.push(event.target.result);
                    }
                }
            } else {
                this.snackBar.openFromComponent(SnackbarComponent, {
                    data: this.fileData[i].name + ' exceeds the maximum size(' + this.field.control.fileSize + ')',
                });
                this.fileData = [];
                this.isLoad = false;
            }

        }
        this.group.get(this.field.name).setValue(this.urls, { emitEvent: false });
    }
    // fileProgress(fileInput: any) {
    //     this.fileData = fileInput as File;
    //     const file = fileInput;
    //     const type = file.type;
    //     const name = file.name + this.field.name;
    //     if (this.fileData) {
    //         this.preview();
    //     }
    // }

    dataURLToBlob(dataURL, fileType) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: fileType });
    }

    changeFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            this.previewUrl = reader.result;
            this.isLoad = true;
            reader.onerror = error => reject(error);
        });
    }

    // preview() {
    //     // Show preview
    //     const mimeType = this.fileData.type;

    //     const reader = new FileReader();
    //     reader.readAsDataURL(this.fileData);
    //     reader.onload = (event) => {
    //         this.previewUrl = reader.result;
    //         const blob = this.dataURLToBlob(this.previewUrl, this.fileData.type);
    //         const newFileName = this.fileData.name + this.field.name;
    //         const file = new File([blob], newFileName);
    //         this.group.get(this.field.name).setValue(file);
    //         this.isLoad = true;
    //         if (this.fileData.size > 500000) {
    //             this.snackBar.openFromComponent(SnackbarComponent, {
    //                 data: 'Maximum size 500kb allowed',
    //             });
    //             this.previewUrl = null;
    //             this.fileData = null;
    //             this.isLoad = false;
    //             this.group.get(this.field.name).setValue(null);
    //         }
    //     };
    // }

    transform() {
        if (this.previewUrl !== null && this.previewUrl !== undefined) {
            return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
        }
    }

    loadGridImages() {
        let imageKeyList = new ImageKeysVO();
        const imageKeys = this.group.get(this.field.name).value;
        if (imageKeys != null && imageKeys !== '') {
            for (let i = 0; i < imageKeys.length; i++) {
                if (!imageKeys[i].includes('base64')) {
                    this.replaceImageKeys.push(imageKeys[i].replace('thumbnail', ''));
                }
            }
            imageKeyList.imageKeys = this.replaceImageKeys;
            this.replaceImageKeys = [];
            if (imageKeyList.imageKeys.length > 0) {
                this.getImagesList(imageKeyList)
            }
        }

    }

    getImagesList(imageKeyList) {
        if (this.imagesList === undefined || this.imagesList.length === 0) {
            let imageKeysList: any[] = [];
            let imageKeyLists = new ImageKeysVO();
            imageKeyList.imageKeys.forEach(imageKey => {
                if (!this.imagesList.some(key => key.imageKey === imageKey)) {
                    imageKeysList.push(imageKey);
                }
            });
            if (imageKeysList.length > 0) {
                imageKeyLists.imageKeys = imageKeysList;
                this.pageService.getGridImages(imageKeyLists).subscribe(images => {
                    if (images) {

                        this.imagesList = images;
                        // this.urls = [];
                        for (let i = 0; i < this.imagesList.length; i++) {
                            this.urls.push(this.imagesList[i].imageString);
                            this.group.get(this.field.name).setValue(this.urls, { emitEvent: false });
                        }
                    }
                });
            }
        }
    }

    getUploaded($event) {
        if ($event === true) {
            this.group.get(this.field.name).setValue(this.loadLogo.fileData);
            this.previewUrl = this.loadLogo.previewUrl;
            this.group.markAsDirty();
            this.allowToSubmit = true;
        }
    }

    /******** Using Uppy for upload ************/

    uploadFile(): void {
        var minFile = 1;
        var maxFile = 1;
        var fileTypes: string[] = [];
        if (this.field.control.fileType === 'image') {
            fileTypes.push('image/*');
        } else if (this.field.control.fileType === 'pdf') {
            fileTypes.push('.pdf');
        } else if (this.field.control.fileType === 'xlsx') {
            fileTypes.push('.xlsx', '.xls');
        } else {
            for (let i = 0; i < this.field.control.fileType.length; i++) {
                if (this.field.control.fileType[i] === 'image') {
                    fileTypes.push('image/*');
                } else if (this.field.control.fileType[i] === 'pdf') {
                    fileTypes.push('.pdf');
                } else if (this.field.control.fileType[i] === 'excel') {
                    fileTypes.push('.xlsx', '.xls');
                } else if (this.field.control.fileType[i] === 'word') {
                    fileTypes.push('.doc', '.docx', '.dotx');
                } else if (this.field.control.fileType[i] === 'ppt') {
                    fileTypes.push('.ppt', '.pptx');
                }
            }
        }
        if (this.field.control.fileType.includes('any')) {
            fileTypes = null;
        }
        if (this.field.control.allowToUploadMultipleFiles === true) {
            maxFile = null;
        }
        var restrictions = {
            maxFileSize: this.field.control.fileSize * 1000,
            maxNumberOfFiles: maxFile,
            minNumberOfFiles: minFile,
            allowedFileTypes: fileTypes
        };
        const dialog = this.dialog.open(UppyComponentComponent, {
            width: '660px',
            disableClose: true,
            maxHeight: '650px',
            data: { from: 'file-upload', metaData: {}, endpoint: '../rendering-service/dynamic-page/v1/upload-file', restrictions: restrictions },
        });
        dialog.afterClosed().subscribe(data => {
            if (data !== undefined && data !== null && data.length > 0) {
                this.isUpload = true;
                if (this.group.get(this.field.name).value === undefined
                    || this.group.get(this.field.name).value === null) {
                    this.group.get(this.field.name).setValue(data);
                    this.uploadFiles = data;
                } else {
                    for (let i = 0; i < data.length; i++) {
                        this.uploadFiles.push(data[i]);
                    }
                    this.group.get(this.field.name).setValue(this.uploadFiles);
                }
            }else{
                this.showError = true;
            }
        });
    }

    downloadFile(fileVO: FilesVO): void {
        this.pageService.downloadAttachedFile(fileVO.filePath).subscribe(data => {
            const file = new Blob([data], { type: data.type });
            FileSaver.saveAs(file, fileVO.fileName);
        });
    }

    deleteFile(files: FilesVO, i: number): void {
        const dialog = this.dialog.open(RenderingConfirmDialogBoxComponent, {
            disableClose: true,
            width: '250px',
            data: {
                type: 'deleteFile', file: files,
                uploadedFiles: this.uploadFiles, index: i, form: this.group, page: this.page, fieldName: this.field.name
            }
        });
        dialog.afterClosed().subscribe(data => {
            if (data !== false) {
                this.isUpload = true;
                this.group.get(this.field.name).setValue(this.uploadFiles);
                this.removedFiles.push(files);
                this.group.get('removedFiles').setValue(this.removedFiles);
            }
        });
    }
}
