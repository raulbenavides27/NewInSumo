import { TestBed } from '@angular/core/testing';

import { ItdService } from './itd.service';

describe('ItdService', () => {
  let service: ItdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
