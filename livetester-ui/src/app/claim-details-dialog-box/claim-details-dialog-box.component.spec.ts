import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDetailsDialogBoxComponent } from './claim-details-dialog-box.component';

describe('ClaimDetailsDialogBoxComponent', () => {
  let component: ClaimDetailsDialogBoxComponent;
  let fixture: ComponentFixture<ClaimDetailsDialogBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimDetailsDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDetailsDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
