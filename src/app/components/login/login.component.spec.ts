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

  it('should login and setLoggedIn when response contains token and userId, then navigate', () => {
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.login.and.returnValue(
      of({ token: 'jwt', userId: 123, email: 'john@example.com' })
    );

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('john@example.com', 'secret');
    expect(authService.setLoggedIn).toHaveBeenCalledWith('john@example.com', 123, 'jwt');

    expect(component.isLoading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/projects']);
    expect(component.errorMessage).toBeNull();
  });

  it('should login and navigate even when token/userId are empty (no setLoggedIn)', () => {
    component.email = 'john@example.com';
    component.password = 'secret';

    // Objet conforme à LoginResponse mais condition (token && userId) => false
    authService.login.and.returnValue(
      of({ token: '', userId: 0, email: 'john@example.com' })
    );

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('john@example.com', 'secret');
    expect(authService.setLoggedIn).not.toHaveBeenCalled();

    expect(component.isLoading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should set errorMessage for 401/400 errors', () => {
    component.email = 'john@example.com';
    component.password = 'bad';

    authService.login.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Email ou mot de passe incorrect.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set errorMessage for 404 error', () => {
    component.email = 'john@example.com';
    component.password = 'bad';

    authService.login.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Utilisateur non trouvé.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set errorMessage for other errors', () => {
    component.email = 'john@example.com';
    component.password = 'bad';

    authService.login.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Erreur serveur. Veuillez réessayer.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
