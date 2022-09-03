import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCartConfigurationComponent } from './shopping-cart-configuration.component';

describe('ShoppingCartConfigurationComponent', () => {
  let component: ShoppingCartConfigurationComponent;
  let fixture: ComponentFixture<ShoppingCartConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoppingCartConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCartConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
