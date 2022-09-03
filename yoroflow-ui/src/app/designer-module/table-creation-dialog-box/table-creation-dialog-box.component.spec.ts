import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCreationDialogBoxComponent } from './table-creation-dialog-box.component';

describe('TableCreationDialogBoxComponent', () => {
  let component: TableCreationDialogBoxComponent;
  let fixture: ComponentFixture<TableCreationDialogBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableCreationDialogBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCreationDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
