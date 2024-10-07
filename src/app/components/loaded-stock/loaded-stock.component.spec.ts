import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadedStockComponent } from './loaded-stock.component';

describe('LoadedStockComponent', () => {
  let component: LoadedStockComponent;
  let fixture: ComponentFixture<LoadedStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadedStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadedStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
