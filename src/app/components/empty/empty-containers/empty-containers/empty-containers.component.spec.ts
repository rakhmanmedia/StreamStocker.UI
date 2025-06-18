import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyContainersComponent } from './empty-containers.component';

describe('EmptyContainersComponent', () => {
  let component: EmptyContainersComponent;
  let fixture: ComponentFixture<EmptyContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyContainersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
