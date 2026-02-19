import { TestBed } from '@angular/core/testing';
import { AuthService, LoginResponse } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8080/api/auth';

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  // ===============================
  // AUTHENTIFICATION
  // ===============================

  it('login should call POST /login and setLoggedIn when status is success', () => {
    const email = 'user@test.com';
    const password = 'pwd';

    let received: LoginResponse | undefined;

    service.login(email, password).subscribe((res) => (received = res));

    const req = httpMock.expectOne(`${API}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password });

    req.flush({
      status: 'success',
      message: 'Connexion réussie !',
      userId: 42,
      email: 'server@email.com',
      username: 'adrien',
      role: 'ADMIN',
    } as LoginResponse);

    expect(received).toBeTruthy();

    // ✅ plus de token : on stocke session via userId/email/role
    expect(localStorage.getItem('userEmail')).toBe('server@email.com');
    expect(localStorage.getItem('userId')).toBe('42');
    expect(localStorage.getItem('username')).toBe('adrien');
    expect(localStorage.getItem('role')).toBe('ADMIN');

    expect(service.isLoggedIn()).toBeTrue();
  });

  it('login should fallback to input email if response email is null/undefined', () => {
    const email = 'fallback@test.com';
    const password = 'pwd';

    service.login(email, password).subscribe();

    const req = httpMock.expectOne(`${API}/login`);
    req.flush({
      status: 'success',
      message: 'ok',
      userId: 7,
      email: undefined as any, // force fallback
      username: 'u',
      role: 'MEMBRE',
    } as LoginResponse);

    expect(localStorage.getItem('userEmail')).toBe(email);
    expect(localStorage.getItem('userId')).toBe('7');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('login should NOT set session when status is not success (and should clear storage)', () => {
    // on pollue exprès
    localStorage.setItem('userEmail', 'old@test.com');
    localStorage.setItem('userId', '99');
    localStorage.setItem('username', 'old');
    localStorage.setItem('role', 'ADMIN');

    service.login('user@test.com', 'pwd').subscribe();

    const req = httpMock.expectOne(`${API}/login`);
    req.flush({
      status: 'error',
      message: 'Bad credentials',
      userId: null as any,
      email: 'user@test.com',
    });

    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();

    expect(service.isLoggedIn()).toBeFalse();
  });

  it('login should NOT set session when userId is missing (defensive branch)', () => {
    service.login('user@test.com', 'pwd').subscribe();

    const req = httpMock.expectOne(`${API}/login`);
    req.flush({
      status: 'success',
      message: 'ok',
      userId: undefined as any,
      email: 'server@email.com',
    });

    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('register should call POST /register with payload', () => {
    const payload = {
      username: 'adrien',
      email: 'adrien@test.com',
      password: 'pwd',
      userRole: 1,
    };

    service.register(payload).subscribe();

    const req = httpMock.expectOne(`${API}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ ok: true });
  });

  it('logout should clear session keys and set auth to false', () => {
    localStorage.setItem('userEmail', 'e');
    localStorage.setItem('userId', '1');
    localStorage.setItem('username', 'u');
    localStorage.setItem('role', 'ADMIN');

    service.logout();

    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  // ===============================
  // ETAT AUTH / GETTERS
  // ===============================

  it('getLoggedInUserEmail/getUserId/getRole should return values from localStorage', () => {
    localStorage.setItem('userEmail', 'u@test.com');
    localStorage.setItem('userId', '10');
    localStorage.setItem('role', 'MEMBRE');

    expect(service.getLoggedInUserEmail()).toBe('u@test.com');
    expect(service.getUserId()).toBe(10);
    expect(service.getRole()).toBe('MEMBRE');
  });

  it('getUserId should return null when userId is not in storage', () => {
    localStorage.removeItem('userId');
    expect(service.getUserId()).toBeNull();
  });

  it('setLoggedIn should store values and getAuthStatus should emit true', (done) => {
    service.getAuthStatus().subscribe((isAuth) => {
      if (isAuth === true) {
        expect(localStorage.getItem('userEmail')).toBe('a@test.com');
        expect(localStorage.getItem('userId')).toBe('99');
        expect(localStorage.getItem('username')).toBe('adrien');
        expect(localStorage.getItem('role')).toBe('ADMIN');
        done();
      }
    });

    service.setLoggedIn('a@test.com', 99, 'adrien', 'ADMIN');
  });
});
