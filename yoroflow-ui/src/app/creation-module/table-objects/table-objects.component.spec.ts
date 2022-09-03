import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableObjectsComponent } from './table-objects.component';

describe('TableObjectionComponent', () => {
  let component: TableObjectsComponent;
  let fixture: ComponentFixture<TableObjectsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableObjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
