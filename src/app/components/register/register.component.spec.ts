import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    spyOn(console, 'log');
    spyOn(console, 'error');

    await TestBed.configureTestingModule({
      imports: [RegisterComponent], // standalone
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error when a field is missing', () => {
    component.username = '';
    component.email = 'john@example.com';
    component.password = 'secret';

    component.onSubmit();

    expect(component.errorMessage).toBe('Veuillez remplir tous les champs.');
    expect(authService.register).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should register and navigate to /login when backend returns success', () => {
    component.username = 'John';
    component.email = 'john@example.com';
    component.password = 'secret';
    component.userRole = 1;

    authService.register.and.returnValue(
      of({ status: 'success', message: 'OK' } as any)
    );

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      username: 'John',
      email: 'john@example.com',
      password: 'secret',
      userRole: 1,
    });

    expect(component.errorMessage).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set errorMessage when backend response is not success (uses response.message)', () => {
    component.username = 'John';
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.register.and.returnValue(
      of({ status: 'error', message: 'Email déjà utilisé' } as any)
    );

    component.onSubmit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Email déjà utilisé');
  });

  it('should set default errorMessage when backend response is not success and has no message', () => {
    component.username = 'John';
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.register.and.returnValue(
      of({ status: 'error' } as any)
    );

    component.onSubmit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Une erreur est survenue, veuillez réessayer.');
  });

  it('should set errorMessage from http error payload when register fails', () => {
    component.username = 'John';
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.register.and.returnValue(
      throwError(() => ({ error: { message: 'Erreur API' } }))
    );

    component.onSubmit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Erreur API');
  });

  it('should set default errorMessage when register fails without message', () => {
    component.username = 'John';
    component.email = 'john@example.com';
    component.password = 'secret';

    authService.register.and.returnValue(
      throwError(() => ({}))
    );

    component.onSubmit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Une erreur est survenue, veuillez réessayer.');
  });
});
