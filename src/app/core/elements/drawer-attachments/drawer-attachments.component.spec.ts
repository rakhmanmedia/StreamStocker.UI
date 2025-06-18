import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawerAttachmentsComponent } from './drawer-attachments.component';

describe('DrawerAttachmentsComponent', () => {
  let component: DrawerAttachmentsComponent;
  let fixture: ComponentFixture<DrawerAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrawerAttachmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawerAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
