import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'setLoggedIn']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    spyOn(console, 'error');

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error when email or password is empty', () => {
    component.email = '   ';
    component.password = '';
    component.onSubmit();

    expect(component.errorMessage).toBe('Veuillez remplir tous les champs.');
    expect(component.isLoading).toBeFalse();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should login and call setLoggedIn(email, userId) when success + userId, then navigate', () => {
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.login.and.returnValue(
      of({
        status: 'success',
        message: 'Connexion réussie !',
        userId: 123,
        email: 'john@example.com',
      } as any)
    );

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('john@example.com', 'secret');
    expect(authService.setLoggedIn).toHaveBeenCalledWith('john@example.com', 123);

    expect(component.isLoading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/projects']);
    expect(component.errorMessage).toBeNull();
  });

  it('should NOT navigate and should set backend message when status is not success', () => {
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.login.and.returnValue(
      of({
        status: 'error',
        message: 'Bad credentials',
        userId: 0,
        email: 'john@example.com',
      } as any)
    );

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('john@example.com', 'secret');
    expect(authService.setLoggedIn).not.toHaveBeenCalled();

    expect(component.isLoading).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Bad credentials');
  });

  it('should NOT navigate and should set errorMessage when userId is missing (defensive branch)', () => {
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.login.and.returnValue(
      of({
        status: 'success',
        message: 'Connexion réussie !',
        userId: undefined,
        email: 'john@example.com',
      } as any)
    );

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('john@example.com', 'secret');
    expect(authService.setLoggedIn).not.toHaveBeenCalled();

    expect(component.isLoading).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Connexion réussie !');
  });

  it('should set errorMessage for 401/400 errors', () => {
    component.email = 'john@example.com';
    component.password = 'bad';

    authService.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Email ou mot de passe incorrect.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set errorMessage for 404 error', () => {
    component.email = 'john@example.com';
    component.password = 'bad';

    authService.login.and.returnValue(throwError(() => ({ status: 404 })));

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Utilisateur non trouvé.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set errorMessage for other errors', () => {
    component.email = 'john@example.com';
    component.password = 'bad';

    authService.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Erreur serveur. Veuillez réessayer.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
