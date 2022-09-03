import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgCustomAttributesComponent } from './org-custom-attributes.component';

describe('OrgCustomAttributesComponent', () => {
  let component: OrgCustomAttributesComponent;
  let fixture: ComponentFixture<OrgCustomAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgCustomAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgCustomAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
