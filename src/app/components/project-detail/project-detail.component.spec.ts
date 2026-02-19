import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProjectDetailComponent } from './project-detail.component';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';

describe('ProjectDetailComponent', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let component: ProjectDetailComponent;

  let projectSpy: jasmine.SpyObj<ProjectService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let taskSpy: jasmine.SpyObj<TaskService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    projectSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjectById',
      'getProjectMembers',
      'updateProject',
      'deleteProject',
      'addUserToProject',
    ]);

    authSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserId',
      'getLoggedInUserEmail',
    ]);

    taskSpy = jasmine.createSpyObj<TaskService>('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'getTaskHistory',
    ]);

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '12' : null) } },
          },
        },
        { provide: Router, useValue: routerSpy },
        { provide: ProjectService, useValue: projectSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: TaskService, useValue: taskSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load project, members, tasks and init newTask project + targetUserId', () => {
    authSpy.getUserId.and.returnValue(7);
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');

    projectSpy.getProjectById.and.returnValue(of({ id: 12, clientEmail: 'x@test.com' }));
    projectSpy.getProjectMembers.and.returnValue(of([]));
    taskSpy.getTasks.and.returnValue(of([]));

    component.ngOnInit();

    expect(projectSpy.getProjectById).toHaveBeenCalledWith(12);
    expect(projectSpy.getProjectMembers).toHaveBeenCalledWith(12);
    expect(taskSpy.getTasks).toHaveBeenCalledWith({ projectId: 12 });

    expect(component.newTask.project).toEqual({ id: 12 });
    expect(component.newTask.targetUserId).toBe(7);
  });

  it('resolveCurrentUserRole should set ADMIN when project.clientEmail matches current email (case-insensitive)', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('ME@TEST.COM');

    component.project = { id: 12, clientEmail: 'me@test.com' };
    component.members = [{ email: 'other@test.com', role: 'MEMBRE' }];

    (component as any).resolveCurrentUserRole();

    expect(component.currentUserRole).toBe('ADMIN');
    expect(component.canInvite).toBeTrue();
    expect(component.canEditProject).toBeTrue();
  });

  it('resolveCurrentUserRole should set role from members when not owner', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('me@test.com');

    component.project = { id: 12, clientEmail: 'owner@test.com' };
    component.members = [{ email: 'me@test.com', role: 'MEMBRE' }];

    (component as any).resolveCurrentUserRole();

    expect(component.currentUserRole).toBe('MEMBRE');
    expect(component.canInvite).toBeFalse();
    expect(component.canCreateTask).toBeTrue();
  });

  it('resolveCurrentUserRole should set NONE when no current email', () => {
    authSpy.getLoggedInUserEmail.and.returnValue('');

    component.project = { id: 12, clientEmail: 'owner@test.com' };
    component.members = [{ email: 'me@test.com', role: 'MEMBRE' }];

    (component as any).resolveCurrentUserRole();

    expect(component.currentUserRole).toBe('NONE');
    expect(component.canCreateTask).toBeFalse();
  });

  it('showToast/hideToast should toggle toastVisible', fakeAsync(() => {
    (component as any).showToast('success', 'T', 'M', 50);
    expect(component.toastVisible).toBeTrue();

    tick(60);
    expect(component.toastVisible).toBeFalse();

    (component as any).showToast('error', 'T2', 'M2', 5000);
    expect(component.toastVisible).toBeTrue();

    component.hideToast();
    expect(component.toastVisible).toBeFalse();
  }));

  it('inviteMember should call addUserToProject and reload members on success', () => {
    component.project = { id: 12, clientEmail: 'owner@test.com' };
    component.currentUserRole = 'ADMIN';

    component.inviteEmail = ' member@test.com ';
    component.inviteRole = 'MEMBRE';

    projectSpy.addUserToProject.and.returnValue(of({}));
    projectSpy.getProjectMembers.and.returnValue(of([{ email: 'member@test.com', role: 'MEMBRE' }]));

    component.inviteMember();

    expect(projectSpy.addUserToProject).toHaveBeenCalledWith(12, 'member@test.com', 'MEMBRE');
    expect(projectSpy.getProjectMembers).toHaveBeenCalledWith(12);
    expect(component.toastVisible).toBeTrue();
  });

  it('inviteMember should show error toast on failure', () => {
    component.project = { id: 12, clientEmail: 'owner@test.com' };
    component.currentUserRole = 'ADMIN';

    component.inviteEmail = 'member@test.com';
    component.inviteRole = 'MEMBRE';

    projectSpy.addUserToProject.and.returnValue(throwError(() => new Error('boom')));

    component.inviteMember();

    expect(component.toastVisible).toBeTrue();
    expect(component.toastType).toBe('error');
  });

  it('createTask should call createTask and then reload tasks', () => {
    authSpy.getUserId.and.returnValue(7);

    component.project = { id: 12, clientEmail: 'owner@test.com' };
    component.currentUserRole = 'ADMIN';

    component.newTask = {
      title: 'A',
      description: '',
      dueDate: null,
      status: 'En cours',
      priority: 'MOYENNE',
      targetUserId: 7,
      project: { id: 12 },
    };

    taskSpy.createTask.and.returnValue(of({ id: 99 } as any));
    taskSpy.getTasks.and.returnValue(of([]));

    component.createTask();

    expect(taskSpy.createTask).toHaveBeenCalled();
    expect(taskSpy.getTasks).toHaveBeenCalledWith({ projectId: 12 });
  });

  it('loadHistory should toggle close if same taskId is already visible', () => {
    component.currentUserRole = 'ADMIN';
    component.visibleHistoryTaskId = 3;
    component.selectedTaskHistory = [{ id: 1 }];

    component.loadHistory(3);

    expect(component.visibleHistoryTaskId).toBeNull();
    expect(component.selectedTaskHistory).toEqual([]);
  });

  it('loadHistory should call getTaskHistory and set visibleHistoryTaskId', () => {
    component.currentUserRole = 'ADMIN';

    taskSpy.getTaskHistory.and.returnValue(of([{ id: 1 }]));

    component.loadHistory(3);

    expect(taskSpy.getTaskHistory).toHaveBeenCalledWith(3);
    expect(component.visibleHistoryTaskId).toBe(3);
    expect(component.selectedTaskHistory).toEqual([{ id: 1 }]);
  });

  it('loadHistory should set error when getTaskHistory fails', () => {
    component.currentUserRole = 'ADMIN';
    taskSpy.getTaskHistory.and.returnValue(throwError(() => new Error('fail')));

    component.loadHistory(3);

    expect(component.error).toContain('Impossible de récupérer');
  });

  it('updateTask should call taskService.updateTask, reload tasks and loadHistory', () => {
    component.project = { id: 12, clientEmail: 'owner@test.com' };
    component.currentUserRole = 'ADMIN';

    component.editingTask = {
      id: 7,
      title: 'T',
      description: '',
      dueDate: null,
      status: 'En cours',
      priority: 'MOYENNE',
      targetUserId: 7,
      project: { id: 12 },
    } as any;

    taskSpy.updateTask.and.returnValue(of({ id: 7 } as any));
    taskSpy.getTasks.and.returnValue(of([]));
    taskSpy.getTaskHistory.and.returnValue(of([{ id: 1 }]));

    component.updateTask();

    expect(taskSpy.updateTask).toHaveBeenCalled();
    expect(taskSpy.getTasks).toHaveBeenCalledWith({ projectId: 12 });
    expect(taskSpy.getTaskHistory).toHaveBeenCalledWith(7);
  });
});
