import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableObjectComponent } from './table-object.component';

describe('TableObjectComponent', () => {
  let component: TableObjectComponent;
  let fixture: ComponentFixture<TableObjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
