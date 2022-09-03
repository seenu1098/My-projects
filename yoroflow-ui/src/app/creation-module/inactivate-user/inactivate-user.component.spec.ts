import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivateUserComponent } from './inactivate-user.component';

describe('InactivateUserComponent', () => {
  let component: InactivateUserComponent;
  let fixture: ComponentFixture<InactivateUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactivateUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
