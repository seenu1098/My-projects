import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableControlValidationComponent } from './table-control-validation.component';

describe('TableControlValidationComponent', () => {
  let component: TableControlValidationComponent;
  let fixture: ComponentFixture<TableControlValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableControlValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableControlValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
