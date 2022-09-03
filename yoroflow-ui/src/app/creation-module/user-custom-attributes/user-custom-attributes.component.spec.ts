import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCustomAttributesComponent } from './user-custom-attributes.component';

describe('UserCustomAttributesComponent', () => {
  let component: UserCustomAttributesComponent;
  let fixture: ComponentFixture<UserCustomAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCustomAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCustomAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
