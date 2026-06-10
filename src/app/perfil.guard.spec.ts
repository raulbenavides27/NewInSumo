import { TestBed } from '@angular/core/testing';

import { PerfilGuard } from './pages/perfil/perfil.guard';

describe('PerfilGuard', () => {
  let guard: PerfilGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PerfilGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
