import {
  ComponentFactoryResolver,
  Directive,
  Input,
  OnInit,
  ViewContainerRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';

import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { SelectComponent } from '../select/select.component';
import { DateComponent } from '../date/date.component';
import { RadiobuttonComponent } from '../radiobutton/radiobutton.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { TextAreaComponent } from '../text-area/text-area.component';
import { MultipleSelectionComponent } from '../multiple-selection/multiple-selection.component';
import { GridComponent } from '../grid/grid.component';
import { ChipComponent } from '../chip/chip.component';
import { FieldConfig, Page } from '../../vo/page-vo';
import { ParagraphComponent } from '../paragraph/paragraph .component';
import { AutoCompleteComponent } from '../auto-complete/auto-complete.component';
import { LabelComponent } from '../label/label.component';
import { DividerComponent } from '../divider/divider.component';
import { TabbedMenuComponent } from '../tabbed-menu/tabbed-menu.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { HyperLinkComponent } from '../hyper-link/hyper-link.component';
import { EmbeddedPageComponent } from '../embedded-page/embedded-page.component';
import { PasswordComponent } from '../password/password.component';
import { SignatureComponent } from '../signature/signature.component';
import { ExportToPdfComponent } from '../export-to-pdf/export-to-pdf.component';
import { TableComponent } from '../table/table.component';
import { ImageComponent } from '../image/image-component';
import { ImageGridComponent } from '../image-grid/image-grid.component';
import { CardComponent } from '../card/card.component';
import { ShoppingCardComponent } from '../shopping-card/shopping-card.component';

import { CurrencyComponent } from '../currency/currency.component';
import { DateTimeComponent } from '../date-time/date-time.component';
import { UserFieldComponent } from '../user-field/user-field.component';
const componentMapper = {
  input: InputComponent,
  email: InputComponent,
  tel: InputComponent,
  computeFields: InputComponent,
  button: ButtonComponent,
  select: SelectComponent,
  date: DateComponent,
  radiobutton: RadiobuttonComponent,
  checkbox: CheckboxComponent,
  textarea: TextAreaComponent,
  multipleselect: MultipleSelectionComponent,
  grid: GridComponent,
  chip: ChipComponent,
  paragraph: ParagraphComponent,
  autocomplete: AutoCompleteComponent,
  label: LabelComponent,
  divider: DividerComponent,
  tabbedmenu: TabbedMenuComponent,
  fileupload: FileUploadComponent,
  hyperlink: HyperLinkComponent,
  page: EmbeddedPageComponent,
  password: PasswordComponent,
  signaturecontrol: SignatureComponent,
  extractaspdf: ExportToPdfComponent,
  table: TableComponent,
  image: ImageComponent,
  imagegrid: ImageGridComponent,
  card: CardComponent,
  shoppingcart: ShoppingCardComponent,
  currency: CurrencyComponent,
  datetime: DateTimeComponent,
  userField: UserFieldComponent
};
@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[dynamicField]',
})
export class DynamicFieldDirective implements OnInit {
  @Input() fieldConfig: FieldConfig;
  @Input() group: FormGroup;
  @Input() page: Page;


  @Output() getComponentFromRow: EventEmitter<any> = new EventEmitter<any>();

  componentRef: any;
  constructor(
    public resolver: ComponentFactoryResolver,
    public container: ViewContainerRef
  ) {
  }

  ngOnInit() {
    if (this.fieldConfig && this.fieldConfig.controlType !== 'hiddencontrol') {
      if (this.group.get('isWorkflow') && !this.group.get('publicpage')) {
        this.createComponentBasedOnWorkflow();
      } else if (this.group.get('isFromTabbedMenu')) {
        this.createComponentBasedOnTabbedMenu();
      } else if (this.group.get('isExcludeButton')) {
        this.createComponentBasedOnWorkflow();
      } else {
        this.componentRef = this.createComponent();
      }

      if (this.componentRef) {
        // tslint:disable-next-line: max-line-length
        if (this.fieldConfig.controlType === 'input' || this.fieldConfig.controlType === 'email' || this.fieldConfig.controlType === 'tel'
          || this.fieldConfig.controlType === 'currency' || this.fieldConfig.controlType === 'computeFields') {
          this.componentRef.instance.fieldConfig = this.fieldConfig;
        } else {
          this.componentRef.instance.field = this.fieldConfig.field;
        }
      }

      if (this.componentRef) {
        this.componentRef.instance.group = this.group;
      }

      if (this.componentRef) {
        if (this.fieldConfig.controlType === 'chip' || this.fieldConfig.controlType === 'grid'
          || this.fieldConfig.controlType === 'fileupload' || this.fieldConfig.controlType === 'button'
          || this.fieldConfig.controlType === 'signaturecontrol' || this.fieldConfig.controlType === 'shoppingcart') {
          this.getComponentFromRow.emit(this.componentRef.instance);
        }
      }
    }
  }

  removeControl() {
    this.group.removeControl('isExcludeButton');
  }

  createComponent() {
    return this.container.createComponent(this.getFactory(this.fieldConfig.controlType));
  }

  createComponentBasedOnWorkflow() {
    // if (this.group.get('isApproveRejectForm').value === true) {
    if (this.fieldConfig.controlType !== 'button') {
      this.componentRef = this.createComponent();
    }
    // } else {
    //   this.componentRef = this.createComponent();
    // }
  }

  createComponentBasedOnTabbedMenu() {
    if (this.fieldConfig.controlType !== 'grid') {
      if (this.fieldConfig.controlType === 'button') {
        if (this.fieldConfig.field.control.buttonType !== 'reset') {
          this.componentRef = this.createComponent();
        }
      } else {
        this.componentRef = this.createComponent();
      }
    }
  }

  getFactory(type): any {
    return this.resolver.resolveComponentFactory(
      componentMapper[type]
    );
  }


}
