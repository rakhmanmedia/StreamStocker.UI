import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectedContainersComponent } from './redirected-containers.component';

describe('RedirectedContainersComponent', () => {
  let component: RedirectedContainersComponent;
  let fixture: ComponentFixture<RedirectedContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedirectedContainersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedirectedContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
