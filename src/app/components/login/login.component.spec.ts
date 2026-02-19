import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent], // standalone component
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should show error when email or password missing', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();

    expect(component.errorMessage).toContain('Veuillez remplir tous les champs');
    expect(component.isLoading).toBeFalse();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login with trimmed values', () => {
    const response: LoginResponse = { status: 'error', message: 'nope' };
    authServiceSpy.login.and.returnValue(of(response));

    component.email = '  a@b.com  ';
    component.password = '  pw  ';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('a@b.com', 'pw');
  });

  it('should navigate to /projects when login success + userId', () => {
    const response: LoginResponse = { status: 'success', userId: 1 };
    authServiceSpy.login.and.returnValue(of(response));

    component.email = 'a@b.com';
    component.password = 'pw';
    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should set errorMessage from response.message when login not valid', () => {
    const response: LoginResponse = { status: 'error', message: 'Bad creds' };
    authServiceSpy.login.and.returnValue(of(response));

    component.email = 'a@b.com';
    component.password = 'pw';
    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Bad creds');
  });

  it('should show default error when response has no message', () => {
    const response: LoginResponse = { status: 'error' };
    authServiceSpy.login.and.returnValue(of(response));

    component.email = 'a@b.com';
    component.password = 'pw';
    component.onSubmit();

    expect(component.errorMessage).toBe('Connexion impossible.');
  });

  it('should map 401 error to "Email ou mot de passe incorrect."', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.email = 'a@b.com';
    component.password = 'pw';
    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Email ou mot de passe incorrect');
  });

  it('should map 404 error to "Utilisateur non trouvé."', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    component.email = 'a@b.com';
    component.password = 'pw';
    component.onSubmit();

    expect(component.errorMessage).toContain('Utilisateur non trouvé');
  });

  it('should map other errors to generic server message', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.email = 'a@b.com';
    component.password = 'pw';
    component.onSubmit();

    expect(component.errorMessage).toContain('Erreur serveur');
  });
});
