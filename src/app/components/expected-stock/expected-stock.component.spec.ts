import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpectedStockComponent } from './expected-stock.component';

describe('ExpectedStockComponent', () => {
  let component: ExpectedStockComponent;
  let fixture: ComponentFixture<ExpectedStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpectedStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpectedStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
