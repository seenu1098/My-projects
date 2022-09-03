import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup } from '@angular/forms';
import { TableObjectsVO } from 'src/app/creation-module/table-objects/table-object-vo';
import { TableObjectService } from 'src/app/creation-module/table-objects/table-objects.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-data-table-page',
  templateUrl: './data-table-page.component.html',
  styleUrls: ['./data-table-page.component.scss']
})
export class DataTablePageComponent implements OnInit {

  @Output() public tableObjectId: EventEmitter<any> = new EventEmitter<any>();
  tableObjectsVOList: TableObjectsVO[] = [];
  dataTableId: any;
  isSelect = false;
  form: FormGroup;
  listScrollHeight: any;
  tableScrollHeight: any;
  filterTableObjectsList: TableObjectsVO[] = [];
  activeElement: string;
  
  constructor(public service: TableObjectService, public themeService: ThemeService, private fb: FormBuilder) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadDynamicLayout();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      search: [],
    });
    this.getDataTableList();
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.valueChanges();
  }

  valueChanges(): void {
    this.form.get('search').valueChanges.subscribe(data => {
      if (data) {
        const searchData = data.toLowerCase();
        this.filterTableObjectsList = this.tableObjectsVOList.filter(t => t.tableName.toLowerCase().includes(searchData));
      } else {
        this.filterTableObjectsList = this.tableObjectsVOList;
      }
    });
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.listScrollHeight = (window.innerHeight - 160) + 'px';
      this.tableScrollHeight = (window.innerHeight - 80) + 'px';
    } else {
      this.listScrollHeight = (window.innerHeight - 196) + 'px';
      this.tableScrollHeight = (window.innerHeight - 116) + 'px';
    }
  }

  getDataTableList() {
    this.service.getTableObjectsList().subscribe(data => {
      if (data) {
        this.tableObjectsVOList = data;
        this.filterTableObjectsList = data;
      }
    });
  }

  selectedDataTable(dataTable: TableObjectsVO): void {
    this.isSelect = true;
    this.dataTableId = dataTable.tableObjectId;
    this.activeElement = dataTable.tableName;
    this.tableObjectId.emit(dataTable.tableObjectId);
  }
}
