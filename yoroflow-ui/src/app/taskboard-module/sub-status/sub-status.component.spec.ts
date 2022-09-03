import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubStatusComponent } from './sub-status.component';

describe('SubStatusComponent', () => {
  let component: SubStatusComponent;
  let fixture: ComponentFixture<SubStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
