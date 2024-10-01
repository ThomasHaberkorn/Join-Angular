import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestestComponent } from './testest.component';

describe('TestestComponent', () => {
  let component: TestestComponent;
  let fixture: ComponentFixture<TestestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
