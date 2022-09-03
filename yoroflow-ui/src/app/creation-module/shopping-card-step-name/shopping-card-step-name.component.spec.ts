import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCardStepNameComponent } from './shopping-card-step-name.component';

describe('ShoppingCardStepNameComponent', () => {
  let component: ShoppingCardStepNameComponent;
  let fixture: ComponentFixture<ShoppingCardStepNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoppingCardStepNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCardStepNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
