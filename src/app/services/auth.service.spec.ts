import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse } from './auth.service';
import { take } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8080/api/auth';

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login() should POST and setLoggedIn when success + userId', () => {
    const res: LoginResponse = {
      status: 'success',
      userId: 42,
      email: 'test@mail.com',
      role: 'ADMIN',
    };

    service.login('test@mail.com', 'pw').subscribe((r) => {
      expect(r.status).toBe('success');
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${apiUrl}/login`);
    expect(req.request.body).toEqual({ email: 'test@mail.com', password: 'pw' });

    req.flush(res);

    expect(localStorage.getItem('userEmail')).toBe('test@mail.com');
    expect(localStorage.getItem('userId')).toBe('42');
    expect(localStorage.getItem('userRole')).toBe('ADMIN');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('login() should NOT setLoggedIn when status not success', () => {
    service.login('x@mail.com', 'pw').subscribe();

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${apiUrl}/login`);
    req.flush({ status: 'error', message: 'nope' });

    expect(localStorage.getItem('userId')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('getUserId() should return number when set', () => {
    localStorage.setItem('userId', '10');
    expect(service.getUserId()).toBe(10);
  });

  it('getUserId() should return null when missing', () => {
    localStorage.removeItem('userId');
    expect(service.getUserId()).toBeNull();
  });

  it('logout() should clear storage and set auth status false', () => {
    // Arrange
    localStorage.setItem('userEmail', 'a@b.com');
    localStorage.setItem('userId', '1');
    localStorage.setItem('userRole', 'ADMIN');

    expect(localStorage.getItem('userEmail')).toBe('a@b.com');
    expect(localStorage.getItem('userId')).toBe('1');
    expect(localStorage.getItem('userRole')).toBe('ADMIN');

    // Act
    service.logout();

    // Assert
    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('getUserEmail() should emit email only when logged in', (done) => {
    const values: Array<string | null> = [];

    service
      .getUserEmail()
      .pipe(take(2)) // évite done appelé plusieurs fois
      .subscribe({
        next: (v) => values.push(v),
        complete: () => {
          expect(values.length).toBe(2);
          expect(values[0]).toBeNull();
          expect(values[1]).toBe('x@y.com');
          done();
        },
      });

    // triggers auth state true
    service.setLoggedIn('x@y.com', 99, null);
  });

  it('getUserRole() should emit role only when logged in', (done) => {
    const values: Array<string | null> = [];

    service
      .getUserRole()
      .pipe(take(2)) // évite done appelé plusieurs fois
      .subscribe({
        next: (v) => values.push(v),
        complete: () => {
          expect(values.length).toBe(2);
          expect(values[0]).toBeNull();
          expect(values[1]).toBe('ADMIN');
          done();
        },
      });

    service.setLoggedIn('x@y.com', 99, 'ADMIN');
  });
});
