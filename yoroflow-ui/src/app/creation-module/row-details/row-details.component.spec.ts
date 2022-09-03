import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RowDetailsComponent } from './row-details.component';

describe('RowDetailsComponent', () => {
  let component: RowDetailsComponent;
  let fixture: ComponentFixture<RowDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RowDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
