import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTablePageComponent } from './data-table-page.component';

describe('DataTablePageComponent', () => {
  let component: DataTablePageComponent;
  let fixture: ComponentFixture<DataTablePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTablePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTablePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
