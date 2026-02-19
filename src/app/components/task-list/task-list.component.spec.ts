import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('TaskListComponent', () => {
  let fixture: ComponentFixture<TaskListComponent>;
  let component: TaskListComponent;

  let taskSpy: jasmine.SpyObj<TaskService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let projectSpy: jasmine.SpyObj<ProjectService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const routeStub = {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'projectId' ? '12' : null),
      },
    },
  };

  beforeEach(async () => {
    taskSpy = jasmine.createSpyObj<TaskService>('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask',
      'getTaskHistory',
    ]);
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getUserId']);
    projectSpy = jasmine.createSpyObj<ProjectService>('ProjectService', ['getProjectMembers']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ProjectService, useValue: projectSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set error when user not connected', () => {
    authSpy.getUserId.and.returnValue(null);

    component.ngOnInit();

    expect(component.errorMessage).toContain('Utilisateur non connecté');
    expect(taskSpy.getTasks).not.toHaveBeenCalled();
  });

  it('ngOnInit should set error when projectId missing', () => {
    authSpy.getUserId.and.returnValue(1);

    const badRoute = {
      snapshot: { paramMap: { get: (_: string) => null } },
    };
    (component as any).route = badRoute;

    component.ngOnInit();

    expect(component.errorMessage).toContain('ProjectId manquant');
  });

  it('ngOnInit should load tasks and members when ok', () => {
    authSpy.getUserId.and.returnValue(5);

    const tasks: Task[] = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 5,
        project: { id: 12 },
      },
    ];

    taskSpy.getTasks.and.returnValue(of(tasks));
    projectSpy.getProjectMembers.and.returnValue(of([{ userId: 5, email: 'x@test.com' }]));

    component.ngOnInit();

    expect(component.projectId).toBe(12);
    expect(component.userId).toBe(5);
    expect(taskSpy.getTasks).toHaveBeenCalledWith({ projectId: 12 });
    expect(projectSpy.getProjectMembers).toHaveBeenCalledWith(12);
  });

  it('goBackToProject should navigate', () => {
    component.projectId = 12;
    component.goBackToProject();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', 12]);
  });

  it('createTask should default targetUserId to userId and call service', () => {
    component.projectId = 12;
    component.userId = 7;

    component.newTask = {
      title: 'T',
      description: 'D',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 0,
      project: { id: 0 },
    };

    taskSpy.createTask.and.returnValue(of({ ...component.newTask, id: 99, targetUserId: 7, project: { id: 12 } }));
    taskSpy.getTasks.and.returnValue(of([]));
    projectSpy.getProjectMembers.and.returnValue(of([]));

    component.createTask();

    expect(taskSpy.createTask).toHaveBeenCalled();
    const arg = taskSpy.createTask.calls.mostRecent().args[0];
    expect(arg.targetUserId).toBe(7);
    expect(arg.project).toEqual({ id: 12 });
    expect(component.successMessage).toContain('Tâche créée');
  });

  it('createTask should set errorMessage on failure', () => {
    component.projectId = 12;
    component.userId = 7;

    component.newTask = {
      title: 'T',
      description: 'D',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 0,
      project: { id: 0 },
    };

    taskSpy.createTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.createTask();

    expect(component.errorMessage).toContain('Impossible de créer la tâche');
  });

  it('startEditing should set editingTask when task has id', () => {
    const t: Task = {
      id: 1,
      title: 'A',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
      project: { id: 12 },
    };

    component.startEditing(t);
    expect(component.editingTask).toBeTruthy();
    expect(component.editingTask!.id).toBe(1);
  });

  it('startEditing should do nothing when task has no id', () => {
    const t: Task = {
      title: 'A',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
      project: { id: 12 },
    };

    component.startEditing(t);
    expect(component.editingTask).toBeNull();
  });

  it('updateTask should call service and update local list on success', () => {
    component.projectId = 12;

    const existing: Task = {
      id: 10,
      title: 'Old',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
      project: { id: 12 },
    };
    component.tasks = [existing];

    component.editingTask = { ...(existing as any), id: 10, title: 'New' };

    const updated: Task = { ...existing, title: 'New' };
    taskSpy.updateTask.and.returnValue(of(updated));

    component.updateTask();

    expect(taskSpy.updateTask).toHaveBeenCalledWith(10, jasmine.any(Object));
    expect(component.tasks[0].title).toBe('New');
    expect(component.successMessage).toContain('mise à jour');
    expect(component.editingTask).toBeNull();
  });

  it('updateTask should set errorMessage on failure', () => {
    component.projectId = 12;

    const t: Task = {
      id: 10,
      title: 'Old',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
      project: { id: 12 },
    };
    component.editingTask = { ...(t as any), id: 10 };

    taskSpy.updateTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.updateTask();

    expect(component.errorMessage).toContain('Impossible de mettre à jour');
  });

  it('deleteTask should remove item on success', () => {
    component.tasks = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
        project: { id: 12 },
      },
      {
        id: 2,
        title: 'B',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
        project: { id: 12 },
      },
    ];

    taskSpy.deleteTask.and.returnValue(of(void 0));

    component.deleteTask(1);

    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].id).toBe(2);
    expect(component.successMessage).toContain('supprimée');
  });

  it('deleteTask should set errorMessage on failure', () => {
    component.tasks = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
        project: { id: 12 },
      },
    ];

    taskSpy.deleteTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.deleteTask(1);

    expect(component.errorMessage).toContain('Impossible de supprimer');
  });

  it('showHistory should toggle off when same task selected', () => {
    component.visibleHistoryTaskId = 3;
    component.selectedTaskHistory = [{ x: 1 }];

    component.showHistory(3);

    expect(component.visibleHistoryTaskId).toBeNull();
    expect(component.selectedTaskHistory).toEqual([]);
  });

  it('showHistory should load history and set visibleHistoryTaskId', () => {
    taskSpy.getTaskHistory.and.returnValue(of([{ id: 1 }]));

    component.showHistory(5);

    expect(taskSpy.getTaskHistory).toHaveBeenCalledWith(5);
    expect(component.visibleHistoryTaskId).toBe(5);
    expect(component.selectedTaskHistory.length).toBe(1);
  });

  it('showHistory should set errorMessage on failure', () => {
    taskSpy.getTaskHistory.and.returnValue(throwError(() => ({ status: 500 })));

    component.showHistory(5);

    expect(component.errorMessage).toContain('Impossible de récupérer l’historique');
  });
});
