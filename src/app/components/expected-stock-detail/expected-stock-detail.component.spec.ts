import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpectedStockDetailComponent } from './expected-stock-detail.component';

describe('ExpectedStockDetailComponent', () => {
  let component: ExpectedStockDetailComponent;
  let fixture: ComponentFixture<ExpectedStockDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpectedStockDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpectedStockDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
