import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;
  let component: ProjectsComponent;

  let authSpy: jasmine.SpyObj<AuthService>;
  let projectSpy: jasmine.SpyObj<ProjectService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    localStorage.clear();

    authSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getLoggedInUserEmail',
      'logout',
    ]);
    projectSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjects',
      'addProject',
      'getProjectMembers',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ProjectService, useValue: projectSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set clientEmail and loadProjects', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('owner@test.com');

    projectSpy.getProjects.and.returnValue(of([]));
    spyOn(component, 'loadProjects').and.callThrough();

    component.ngOnInit();

    expect(component.newProject.clientEmail).toBe('owner@test.com');
    expect(component.loadProjects).toHaveBeenCalled();
  });

  it('loadProjects should set projects = all when no current email', fakeAsync(() => {
    // important : le composant fallback sur localStorage si AuthService renvoie vide
    authSpy.getLoggedInUserEmail.and.returnValue('');
    localStorage.removeItem('userEmail');

    const all = [{ id: 1 }, { id: 2 }];
    projectSpy.getProjects.and.returnValue(of(all));

    component.loadProjects();
    flushMicrotasks();

    expect(component.projects.length).toBe(2);
    expect(component.errorMessage).toBeNull();
  }));

  it('loadProjects should keep only owned + memberOf and remove duplicates', fakeAsync(() => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');
    localStorage.removeItem('userEmail');

    const all = [
      { id: 1, clientEmail: 'me@test.com' },
      { id: 2, clientEmail: 'other@test.com' },
      { id: 3, clientEmail: 'other@test.com' },
    ];

    projectSpy.getProjects.and.returnValue(of(all));

    projectSpy.getProjectMembers.and.callFake((projectId: number) => {
      if (projectId === 2) return of([{ email: 'ME@test.com' }]); // case-insensitive
      if (projectId === 3) return of([{ email: 'someone@test.com' }]);
      return of([]);
    });

    component.loadProjects();
    flushMicrotasks();

    const ids = component.projects.map((p) => p.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2]);
    expect(component.errorMessage).toBeNull();
  }));

  it('loadProjects should ignore member check errors (catch) and still set owned', fakeAsync(() => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');
    localStorage.removeItem('userEmail');

    const all = [
      { id: 1, clientEmail: 'me@test.com' },
      { id: 2, clientEmail: 'other@test.com' },
    ];
    projectSpy.getProjects.and.returnValue(of(all));

    projectSpy.getProjectMembers.and.callFake((projectId: number) => {
      if (projectId === 2) return throwError(() => new Error('boom'));
      return of([]);
    });

    component.loadProjects();
    flushMicrotasks();

    expect(component.projects.map((p) => p.id)).toEqual([1]);
    expect(component.errorMessage).toBeNull();
  }));

  it('loadProjects should set errorMessage when service fails', fakeAsync(() => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');
    localStorage.removeItem('userEmail');

    projectSpy.getProjects.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadProjects();
    flushMicrotasks();

    expect(component.errorMessage).toContain('Impossible de charger vos projets');
  }));

  it('toggleAddProjectForm should open and reset clientEmail and clear error', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');
    localStorage.removeItem('userEmail');

    component.errorMessage = 'X';

    component.toggleAddProjectForm();

    expect(component.showAddProjectForm).toBeTrue();
    expect(component.errorMessage).toBeNull();
    expect(component.newProject.clientEmail).toBe('me@test.com');
  });

  it('onSubmit should set errorMessage when required fields missing', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');

    component.newProject = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      statut: 'Non défini',
      clientEmail: '',
    };

    component.onSubmit();

    expect(component.errorMessage).toContain('Veuillez remplir tous les champs');
    expect(projectSpy.addProject).not.toHaveBeenCalled();
  });

  it('onSubmit should call addProject with payload and reload projects on success', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');

    component.newProject = {
      name: '  P1  ',
      description: '  D1  ',
      startDate: '2026-02-01',
      endDate: '',
      statut: 'Non défini',
      clientEmail: 'me@test.com',
    };

    projectSpy.addProject.and.returnValue(of({ id: 10 }));
    projectSpy.getProjects.and.returnValue(of([]));
    projectSpy.getProjectMembers.and.returnValue(of([]));

    spyOn(component, 'loadProjects').and.callThrough();

    component.showAddProjectForm = true;
    component.onSubmit();

    expect(projectSpy.addProject).toHaveBeenCalled();
    expect(component.loadProjects).toHaveBeenCalled();
  });

  it('onSubmit should set errorMessage on addProject error', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');

    component.newProject = {
      name: 'P1',
      description: 'D1',
      startDate: '',
      endDate: '',
      statut: 'Non défini',
      clientEmail: 'me@test.com',
    };

    projectSpy.addProject.and.returnValue(throwError(() => ({ status: 400 })));

    component.onSubmit();

    expect(component.errorMessage).toContain("Impossible d'ajouter le projet");
  });

  it('viewProjectDetails should navigate', () => {
    component.viewProjectDetails(7);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', 7]);
  });

  it('viewProjectTasks should navigate', () => {
    component.viewProjectTasks(9);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', 9, 'tasks']);
  });

  it('logout should call auth.logout and navigate to login', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
