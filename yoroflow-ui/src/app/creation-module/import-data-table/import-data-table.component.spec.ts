import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDataTableComponent } from './import-data-table.component';

describe('ImportDataTableComponent', () => {
  let component: ImportDataTableComponent;
  let fixture: ComponentFixture<ImportDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
