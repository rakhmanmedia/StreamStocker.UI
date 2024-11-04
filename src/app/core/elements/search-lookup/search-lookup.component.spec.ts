import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLookupComponent } from './search-lookup.component';

describe('SearchLookupComponent', () => {
  let component: SearchLookupComponent;
  let fixture: ComponentFixture<SearchLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
