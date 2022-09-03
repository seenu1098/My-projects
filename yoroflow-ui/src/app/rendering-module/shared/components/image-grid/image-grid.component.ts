import { Component, OnInit, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field, ImageGrid, ImageKeysVO, OptionsValue, Select } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { LoadLogoService } from '../../service/load-logo.service';
import { SnackbarComponent } from '../../../../shared-module/snackbar/snackbar.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageService } from '../../service/page-service';
import { ImageRenderDialogComponent } from '../../../image-render-dialog/image-render-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-image-grid',
  template: `
  <ng-container>
  <div [style.height.%]="100" [style.width.%]="100" [style]="field.style" style="margin-top: 2%; margin-bottom: 1%;"
   *ngIf="imagesList && imagesList.length>0" fxLayout="row" [fxLayoutAlign] ="alignItems()">
   
    <div fxLayout="column" fxLayoutGap="5px" [style.height.%]="80" [style.width.%]="80">
    <!-- <ng-container *ngIf="imagesList && imagesList.length>0" style="overflow-y: scroll; overflow-x: hidden !important">
    <ng-container > -->
    <!-- <div style="font-weight: bold;">
    {{imageGridObj.imageGridLabel}}
    </div> -->
    <div fxLayout="row" fxLayoutGap="5px" style="width:100%;height:100%;" *ngFor="let image of images;let z=index;"
    [fxLayoutAlign] ="alignItems()">
    <ng-container *ngIf="image">
    <!-- <div *ngFor="let i of image"  [style.width.%]="100/imageGridObj.noOfColumns"> -->
    <ng-container *ngFor="let i of image;let j=index;">
    <mat-spinner [diameter]="35" style="margin-left: 8px;margin-top: 8px;" [style.height.px]="updateImageHeigt(i.key)" [style.width.px]="updateImageWidth(i.key)" *ngIf="i.url=== ''"></mat-spinner>
    <img [src]="i.url!== '' ? i.url : getImage(i, z, j)" [hidden]="i.url=== ''" (dblclick)="getOriginalImage(i.key)" (click)="selectImage(i.key)"
    [style.height.px]="updateImageHeigt(i.key)" [style.width.px]="updateImageWidth(i.key)" [style.border]="getBorderStyle(i.key)">
    <!-- </div> -->
    </ng-container>
    </ng-container>
    </div>
    <!-- </ng-container>
    </ng-container> -->
    </div>
    </div>
  </ng-container>
`,
  styles: []
})
export class ImageGridComponent implements OnInit {
  field: Field;
  group: FormGroup;
  pageIdentifier: string;
  showControl = true;
  previewUrl: any;
  isLoad = false;
  images: any[][] = [];
  imagesUrl: any[][] = [];
  imagesList = [];
  imageGridObj: ImageGrid;
  scrollHeight: number;
  scrollWidth: number;
  show = true;
  selectedImageIndex: Array<string> = [];
  dynamicOptions: OptionsValue[];
  pageId: any;
  version: any;
  filterVO: Select;
  publicPage = false;
  imageKeyList: any[] = [];
  allowNextImage = true;
  fromSelect = false;
  isSingleClick = true;
  imageKey: string;
  fromFormChange = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  constructor(public el: ElementRef, public loadLogo: LoadLogoService, private sanitizer: DomSanitizer,
    public activateRoute: ActivatedRoute, private cd: ChangeDetectorRef, public pageService: PageService
    , private matDialog: MatDialog, public dynamicService: DynamicQueryBuilderService) { }
  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.imageGridObj = this.field.control as ImageGrid;
    this.scrollHeight = this.imageGridObj.height;
    this.scrollWidth = this.imageGridObj.width;
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        this.pageIdentifier = params.get('id');
      }
    });
    this.imagesList = [];
    this.fromSelect = false;
    const value = this.group.get(this.field.name).value;
    this.imagesList = value;
    if (value !== '' && value !== null) {
      this.selectedImageIndex = value;
    }
    if (this.imagesList && this.imagesList.length > 0) {
      this.show = false;
      // this.group.get(this.field.name).setValue(null);
    }
    // this.loadImage();
    this.buildDataForImageGrid();
    // this.loadGridImages();
    this.addFormValueChanges();
    this.loadFromShoppingCart();
    this.checkPublicPage();
    this.loadConstantOptions();
    this.loadInitialOptions();
    this.loadDynamicOptionValues();
    // <mat-spinner [diameter]="15" style="margin-left: 5px;margin-top: 5px;" *ngIf="i.url=== ''"></mat-spinner>
  }

  loadFromShoppingCart() {
    if (this.field.control && this.field.control.optionType === 'i') {
      this.imagesList = [];
      this.images = [];
      this.imagesList = this.field.control.imageKeys;
      this.buildDataForImageGrid();
    }
  }

  loadFilePath(responseValue: OptionsValue[]): string[] {
    var returnValue: string[] = [];
    responseValue.forEach(grid => {
      if (grid.code.includes('fileName')) {
        const re = /\"/gi;
        grid.code.replace(re, '"');
        grid.code = JSON.parse(grid.code);
        grid.code.forEach(element => {
          if (element.filePath) {
            returnValue.push(element.filePath);
          }
        });
      } else {
        returnValue = grid.code.split(',');
      }
    });
    return returnValue;
  }

  loadInitialOptions() {
    if (this.field.control && this.field.control.addOptions && this.field.control.addOptions === true && this.field.control.optionType === 'd') {
      if (this.field.control.filters && this.field.control.filters.length > 0) {
        this.field.control.filters.forEach(element => {
          if (element.valueType === 'fieldName') {
            const value = this.group.get(element.fieldName).value;
            if (value !== null && value !== '') {
              element.value = value;
              this.filterVO = this.field.control;
              if (this.publicPage) {
                this.dynamicService.getPublicDynamicListByFilterValue(this.filterVO).subscribe(data => {
                  this.imagesList = [];
                  this.images = [];
                  if (data !== [] && data !== null && data.length > 0) {
                    this.dynamicOptions = data;
                    this.imagesList = [];
                    this.images = [];
                    this.imagesList = this.loadFilePath(data);
                    // this.dynamicOptions.forEach(field => {
                    //   let keys: any[] = [];
                    //   keys = field.code.split(',');
                    //   keys.forEach(key => {
                    //     this.imagesList.push(key);
                    //   });
                    // });
                    // this.imagesList = this.group.get(this.field.name).value;
                    this.buildDataForImageGrid();
                  }
                });
              } else {
                this.dynamicService.getDynamicListByFilterValue(this.filterVO).subscribe(data => {
                  this.imagesList = [];
                  this.images = [];
                  if (data !== [] && data !== null && data.length > 0) {
                    this.dynamicOptions = data;
                    this.imagesList = [];
                    this.images = [];
                    this.imagesList = this.loadFilePath(data);
                    // this.dynamicOptions.forEach(field => {
                    //   let keys: any[] = [];
                    //   keys = field.code.split(',');
                    //   keys.forEach(key => {
                    //     this.imagesList.push(key);
                    //   });
                    // });
                    // this.imagesList = this.group.get(this.field.name).value;
                    this.buildDataForImageGrid();
                  }

                });
              }
            }
          }
        });
      }
    }

  }


  loadConstantOptions() {
    if (this.field.control && this.field.control.addOptions && this.field.control.addOptions === true) {
      if (this.publicPage) {
        this.dynamicService.getPublicListValues(this.pageId, this.field.name,
          this.version).subscribe(data => {
            this.imagesList = [];
            this.images = [];
            if (data !== [] && data !== null && data.length > 0) {
              this.dynamicOptions = data;
              this.imagesList = [];
              this.images = [];
              this.imagesList = this.loadFilePath(data);
              // this.dynamicOptions.forEach(field => {
              //   let keys: any[] = [];
              //   keys = field.code.split(',');
              //   keys.forEach(key => {
              //     this.imagesList.push(key);
              //   });
              // });
              // this.imagesList = this.group.get(this.field.name).value;
              this.buildDataForImageGrid();
            }
          });
      } else {
        this.dynamicService.getListValues(this.pageId, this.field.name,
          this.version).subscribe(data => {
            this.imagesList = [];
            this.images = [];
            if (data !== [] && data !== null && data.length > 0) {
              this.dynamicOptions = data;
              this.imagesList = [];
              this.images = [];
              this.imagesList = this.loadFilePath(data);
              // this.dynamicOptions.forEach(field => {
              //   let keys: any[] = [];
              //   keys = field.code.split(',');
              //   keys.forEach(key => {
              //     this.imagesList.push(key);
              //   });
              // });
              // this.imagesList = this.group.get(this.field.name).value;
              this.buildDataForImageGrid();
            }
          });
      }
    }
  }

  checkPublicPage() {
    if (this.group.get('pageIdentifier') && this.group.get('version')) {
      this.pageId = this.group.get('pageIdentifier').value;
      this.version = this.group.get('version').value;
    } else if (this.group.parent && this.group.parent.get('pageIdentifier')) {
      this.pageId = this.group.parent.get('pageIdentifier').value;
      this.version = this.group.parent.get('version').value;
    } else if (this.group.parent && this.group.parent.parent && this.group.parent.parent.get('pageIdentifier')) {
      this.pageId = this.group.parent.parent.get('pageIdentifier').value;
      this.version = this.group.parent.parent.get('version').value;
    }

    if (this.group.get('publicpage')) {
      this.publicPage = true;
    } else if (this.group.parent && this.group.parent.get('publicpage')) {
      this.publicPage = true;
    } else if (this.group.parent && this.group.parent.parent && this.group.parent.parent.get('publicpage')) {
      this.publicPage = true;
    } else {
      this.publicPage = false;
    }
  }

  loadDynamicOptionValues() {
    if (this.field.control && this.field.control.addOptions && this.field.control.addOptions === true && this.field.control.optionType === 'd') {
      if (this.field.control.filters && this.field.control.filters.length > 0) {
        this.field.control.filters.forEach(element => {
          if (element.valueType === 'fieldName') {
            this.group.get(element.fieldName).valueChanges.subscribe(value => {
              this.group.get(this.field.name).setValue(null);
              if (value != null && value !== '') {
                this.dynamicOptions = [];
                element.value = value;
                this.filterVO = this.field.control;
                if (this.publicPage) {
                  this.dynamicService.getPublicDynamicListByFilterValue(this.filterVO).subscribe(data => {
                    this.imagesList = [];
                    this.images = [];
                    if (data !== [] && data !== null && data.length > 0) {
                      this.dynamicOptions = data;
                      this.imagesList = [];
                      this.images = [];
                      this.imagesList = this.loadFilePath(data);
                      // this.dynamicOptions.forEach(field => {
                      //   let keys: any[] = [];
                      //   keys = field.code.split(',');
                      //   keys.forEach(key => {
                      //     this.imagesList.push(key);
                      //   });
                      // });
                      // this.imagesList = this.group.get(this.field.name).value;
                      this.buildDataForImageGrid();
                    }
                  });
                } else {
                  this.dynamicService.getDynamicListByFilterValue(this.filterVO).subscribe(data => {
                    this.imagesList = [];
                    this.images = [];
                    if (data !== [] && data !== null && data.length > 0) {
                      this.dynamicOptions = data;
                      this.imagesList = [];
                      this.images = [];
                      this.imagesList = this.loadFilePath(data);
                      // this.dynamicOptions.forEach(field => {
                      //   let keys: any[] = [];
                      //   keys = field.code.split(',');
                      //   keys.forEach(key => {
                      //     this.imagesList.push(key);
                      //   });
                      // });
                      this.buildDataForImageGrid();
                    }
                  });
                }
              }
            });
          }
        });
      }
    }
  }

  updateImageWidth(i: string) {
    if (this.selectedImageIndex !== null && i === this.selectedImageIndex.find(x => x === i)) {
      const index = '' + (this.imageGridObj.width - 15);
      return index;
    } else {
      const index = '' + this.imageGridObj.width;
      return index;
    }
  }

  updateImageHeigt(i: string) {
    if (this.selectedImageIndex !== null && i === this.selectedImageIndex.find(x => x === i)) {
      const index = '' + (this.imageGridObj.height - 15);
      return index;
    } else {
      const index = '' + this.imageGridObj.height;
      return index;
    }
  }

  getBorderStyle(i: string) {
    if (this.selectedImageIndex !== null && i === this.selectedImageIndex.find(x => x === i)) {
      return '4px solid #2196f3'
    } else {
      return 'none';
    }
  }

  alignItems() {
    if (this.imageGridObj.position === 'left') {
      return 'start start';
    } else if (this.imageGridObj.position === 'right') {
      return 'end end';
    } else if (this.imageGridObj.position === 'center') {
      return 'center center';
    }
  }

  addFormValueChanges() {
    this.group.get(this.field.name).valueChanges.subscribe(data => {
      if (data !== null && !this.fromSelect) {
        const value = this.group.get(this.field.name).value;
        if (this.field.control && this.field.control.optionType !== 'i') {
          this.imagesList = [];
          this.imagesList = value;
          if (value !== '') {
            this.selectedImageIndex = value;
          }
          this.buildDataForImageGrid();
        }
        // this.loadGridImages();
      } else if (data !== null && !this.fromSelect && data.length === 1) {
        this.fromFormChange = true;
        this.selectImage(data[0]);
      }
    })
  }

  loadGridImages() {
    let imageKeyList = new ImageKeysVO();
    const imageKeys = this.group.get(this.field.name).value;
    if (imageKeys != null && imageKeys !== '') {
      imageKeyList.imageKeys = imageKeys;
      // this.imagesList = this.pageService.getImage();
      // this.buildDataForImageGrid();
      this.pageService.getGridImages(imageKeyList).subscribe(images => {
        if (images) {
          this.imagesList = images;
          this.buildDataForImageGrid();
        }
      });
    }
  }

  getOriginalImage(gridImage) {
    this.isSingleClick = false;
    // this.selectedImageIndex = gridImage;
    // this.group.get(this.field.name).setValue(gridImage);
    if (gridImage !== null && gridImage !== '') {
      this.imageKey = gridImage;
      let keys: any[] = [];
      keys.push(gridImage);
      this.fromSelect = true;
      if (this.selectedImageIndex !== null && !this.selectedImageIndex.some(x => x === gridImage)) {
        this.selectedImageIndex.push(gridImage);
      }
      this.group.get(this.field.name).setValue(this.selectedImageIndex);
      const originalImageKey = gridImage.replace('thumbnail', '');
      const width = this.imageGridObj.width.toString() + 'px';
      const height = this.imageGridObj.height.toString() + 'px';
      const dialogRef = this.matDialog.open(ImageRenderDialogComponent, {
        disableClose: true,
        data: { imageKey: originalImageKey, publicForm: this.publicPage },
      });
    }
  }

  selectImage(gridImage) {
    this.isSingleClick = true;
    this.fromFormChange = false;
    setTimeout(() => {
      if (this.isSingleClick) {
        if (!this.fromFormChange && this.selectedImageIndex !== null && this.selectedImageIndex.some(x => x === gridImage)) {
          for (let i = 0; i < this.selectedImageIndex.length; i++) {
            if (this.selectedImageIndex[i] === gridImage) {
              this.selectedImageIndex.splice(i, 1);
            }
          }
          this.imageKey = '';
          this.fromSelect = true;
          this.group.get(this.field.name).setValue(this.selectedImageIndex);
          this.fromFormChange = true;
        } else {
          // this.selectedImageIndex = gridImage;
          this.imageKey = gridImage;
          if (this.selectedImageIndex !== null && !this.selectedImageIndex.some(x => x === gridImage)) {
            this.selectedImageIndex.push(gridImage);
          }
          this.fromSelect = true;
          this.group.get(this.field.name).setValue(this.selectedImageIndex);
        }
      }
    }, 250);
  }

  buildDataForImageGrid() {
    const imageGrid = this.field.control as ImageGrid;
    this.imageKeyList = [];
    if (this.imagesList && this.imagesList.length > 0) {
      imageGrid.noOfRows = this.imagesList.length / imageGrid.noOfColumns;
      for (let i = 0; i < imageGrid.noOfRows; i++) {
        let columns: any[] = []
        for (let j = 0; j < this.imagesList.length; j++) {
          if (i === 0 && j < imageGrid.noOfColumns) {
            columns.push({ url: '', key: this.imagesList[j] });
          }
          if (i > 0) {
            const start = i * imageGrid.noOfColumns;
            const end = (i * imageGrid.noOfColumns) + imageGrid.noOfColumns;
            if (j >= start && j < end) {
              // columns.push(this.imagesList[j]);
              columns.push({ url: '', key: this.imagesList[j] });
            }
          }

        }
        if (columns.length > 0) {
          this.images.push(columns);
        }
        columns = [];
      }
      // if (this.images.length > 0) {
      //   this.selectImage(this.images[0][0].key);
      // }
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

  getImage(imageKey, z, j) {
    if (!this.imageKeyList.some(key => key === imageKey.key) && imageKey.key !== '' && imageKey.key !== null) {
      this.allowNextImage = false;
      this.imageKeyList.push(imageKey.key);
      if (this.publicPage) {
        this.pageService.getImageFromKeyFromPublicForm(imageKey.key).subscribe(images => {
          this.allowNextImage = true;
          if (images) {
            // const url = images.imageString;
            // this.images[z][j].url = url;
            const blob = new Blob([images], { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = (event) => {
              if (this.images[z] && this.images[z][j]) {
                this.images[z][j].url = reader.result;
              }
            };
          }
        });
      } else {
        this.pageService.getImageFromKey(imageKey.key).subscribe(images => {
          this.allowNextImage = true;
          if (images) {
            // const url = images.imageString;
            // this.images[z][j].url = url;
            const blob = new Blob([images], { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = (event) => {
              if (this.images[z] && this.images[z][j]) {
                this.images[z][j].url = reader.result;
              }
            };
          }
        });
      }
    } else if (imageKey.key === '' || imageKey.key === null && this.images[z] && this.images[z][j]) {
      this.images[z][j].url = '    ';
    }
  }

  transform() {
    if (this.previewUrl !== null && this.previewUrl !== undefined) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
    }
  }
}