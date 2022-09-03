import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignaturedialogComponent } from './signaturedialog.component';

describe('SignaturedialogComponent', () => {
  let component: SignaturedialogComponent;
  let fixture: ComponentFixture<SignaturedialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignaturedialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignaturedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
