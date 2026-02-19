import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProjectsComponent } from './projects.component';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  let projectService: jasmine.SpyObj<ProjectService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    projectService = jasmine.createSpyObj<ProjectService>('ProjectService', ['getProjects', 'addProject']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    spyOn(console, 'error');
    spyOn(console, 'log');

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: ProjectService, useValue: projectService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    projectService.getProjects.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load projects and set errorMessage to null when list is not empty', () => {
    projectService.getProjects.and.returnValue(of([{ id: 1, name: 'P1' }]));
    fixture.detectChanges();

    expect(projectService.getProjects).toHaveBeenCalled();
    expect(component.projects.length).toBe(1);
    expect(component.errorMessage).toBeNull();
  });

  it('should load projects and set errorMessage when list is empty', () => {
    projectService.getProjects.and.returnValue(of([]));
    fixture.detectChanges();

    expect(projectService.getProjects).toHaveBeenCalled();
    expect(component.projects).toEqual([]);
    expect(component.errorMessage).toBe('Aucun projet trouvé.');
  });

  it('should handle loadProjects error', () => {
    projectService.getProjects.and.returnValue(throwError(() => ({ status: 500 })));
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Impossible de charger vos projets.');
  });

  it('should toggle add project form', () => {
    component.showAddProjectForm = false;
    component.toggleAddProjectForm();
    expect(component.showAddProjectForm).toBeTrue();

    component.toggleAddProjectForm();
    expect(component.showAddProjectForm).toBeFalse();
  });

  it('should prevent submit when required fields are missing', () => {
    component.newProject = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'pending',
      clientEmail: ''
    } as any;

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Veuillez remplir tous les champs obligatoires, y compris le chef de projet.'
    );
    expect(projectService.addProject).not.toHaveBeenCalled();
  });

  it('should submit project, push response, close form and reset fields', () => {
    component.projects = [];
    component.showAddProjectForm = true;

    component.newProject = {
      name: 'Nouveau',
      description: 'Desc',
      startDate: '2026-02-01',
      endDate: '2026-03-01',
      status: 'pending',
      clientEmail: 'u1.admin@test.com'
    } as any;

    projectService.addProject.and.returnValue(
      of({ id: 99, name: 'Nouveau' } as any)
    );

    component.onSubmit();

    expect(projectService.addProject).toHaveBeenCalled();

    expect(component.projects.length).toBe(1);
    expect(component.projects[0].id).toBe(99);

    expect(component.showAddProjectForm).toBeFalse();
    expect(component.newProject.name).toBe('');
    expect(component.newProject.description).toBe('');
    expect(component.newProject.clientEmail).toBe('');
  });

  it('should handle addProject error', () => {
    component.newProject = {
      name: 'Nouveau',
      description: 'Desc',
      startDate: '2026-02-01',
      endDate: '2026-03-01',
      status: 'pending',
      clientEmail: 'u1.admin@test.com'
    } as any;

    projectService.addProject.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.onSubmit();

    expect(console.error).toHaveBeenCalled();
    expect(component.errorMessage).toBe("Impossible d'ajouter le projet.");
  });

  it('should navigate to project details', () => {
    component.viewProjectDetails(10);
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 10]);
  });

  it('should navigate to project tasks', () => {
    component.viewProjectTasks(10);
    expect(router.navigate).toHaveBeenCalledWith(['/projects', 10, 'tasks']);
  });

  it('should log invite member', () => {
    component.inviteEmail = 'x@y.com';
    component.inviteRole = 'MEMBRE';

    component.inviteMember();

    expect(console.log).toHaveBeenCalled();
  });

  it('should logout and redirect to /login', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
