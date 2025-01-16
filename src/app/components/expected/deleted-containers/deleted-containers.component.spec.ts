import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedContainersComponent } from './deleted-containers.component';

describe('DeletedContainersComponent', () => {
  let component: DeletedContainersComponent;
  let fixture: ComponentFixture<DeletedContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletedContainersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
