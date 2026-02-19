import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskComponent } from './task.component';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

describe('TaskComponent', () => {
  let fixture: ComponentFixture<TaskComponent>;
  let component: TaskComponent;

  let taskSpy: jasmine.SpyObj<TaskService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    taskSpy = jasmine.createSpyObj<TaskService>('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask',
    ]);
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getUserId']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [
        { provide: TaskService, useValue: taskSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadTasks should set tasks on success', () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
        project: { id: 1 },
      },
    ];

    taskSpy.getTasks.and.returnValue(of(tasks));

    component.loadTasks();

    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].id).toBe(1);
  });

  it('getTasksByStatus should filter', () => {
    component.tasks = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
        project: { id: 1 },
      },
      {
        id: 2,
        title: 'B',
        description: '',
        dueDate: null,
        status: 'Terminé',
        priority: 'MOYENNE',
        targetUserId: 1,
        project: { id: 1 },
      },
    ];

    const res = component.getTasksByStatus('Terminé');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(2);
  });

  it('onSubmit should do nothing when user not connected', () => {
    authSpy.getUserId.and.returnValue(null);

    component.task = {
      title: 'X',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 0,
    };

    component.onSubmit();

    expect(taskSpy.createTask).not.toHaveBeenCalled();
  });

  it('onSubmit should set targetUserId and create task', () => {
    authSpy.getUserId.and.returnValue(10);

    component.task = {
      title: 'X',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 0,
    };

    taskSpy.createTask.and.returnValue(of({ ...component.task, id: 99, targetUserId: 10 }));

    component.onSubmit();

    expect(taskSpy.createTask).toHaveBeenCalled();
    const arg = taskSpy.createTask.calls.mostRecent().args[0];
    expect(arg.targetUserId).toBe(10);
    expect(component.tasks.length).toBe(1);
  });

  it('resetTaskForm should set default targetUserId from auth or fallback', () => {
    authSpy.getUserId.and.returnValue(7);

    component.resetTaskForm();

    expect(component.task.targetUserId).toBe(7);
    expect(component.task.status).toBe('En attente');
  });

  it('onDrop should return when no taskId', () => {
    const event = { item: { data: {} } } as unknown as CdkDragDrop<Task[]>;
    component.onDrop(event, 'En cours');
    expect(taskSpy.updateTask).not.toHaveBeenCalled();
  });

  it('onDrop should update status locally and call updateTask', () => {
    component.tasks = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
      },
    ];

    const event = { item: { data: { id: 1 } } } as unknown as CdkDragDrop<Task[]>;
    taskSpy.updateTask.and.returnValue(of({ ...component.tasks[0], status: 'En cours' }));

    component.onDrop(event, 'En cours');

    expect(component.tasks[0].status).toBe('En cours');
    expect(taskSpy.updateTask).toHaveBeenCalledWith(1, { status: 'En cours' });
  });

  it('editTask should open modal and copy task', () => {
    const t: Task = {
      id: 1,
      title: 'A',
      description: 'D',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    component.editTask(t);

    expect(component.showEditModal).toBeTrue();
    expect(component.editingTask).not.toBe(t);
    expect(component.editingTask.title).toBe('A');
  });

  it('updateTask should return when editingTask has no id', () => {
    component.editingTask = {
      title: 'A',
      description: '',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    component.updateTask();

    expect(taskSpy.updateTask).not.toHaveBeenCalled();
  });

  it('updateTask should call service and close modal on success', () => {
    component.editingTask = {
      id: 5,
      title: 'A',
      description: 'B',
      dueDate: null,
      status: 'En attente',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    taskSpy.updateTask.and.returnValue(of({ ...(component.editingTask as any) }));

    component.updateTask();

    expect(taskSpy.updateTask).toHaveBeenCalledWith(5, jasmine.any(Object));
    expect(component.showEditModal).toBeFalse();
  });

  it('deleteTask should not call service when confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteTask(1);

    expect(taskSpy.deleteTask).not.toHaveBeenCalled();
  });

  it('deleteTask should call service and remove task when confirm is true', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.tasks = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
      },
    ];

    taskSpy.deleteTask.and.returnValue(of(void 0));

    component.deleteTask(1);

    expect(taskSpy.deleteTask).toHaveBeenCalledWith(1);
    expect(component.tasks.length).toBe(0);
  });

  it('deleteTask should keep list when service fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.tasks = [
      {
        id: 1,
        title: 'A',
        description: '',
        dueDate: null,
        status: 'En attente',
        priority: 'MOYENNE',
        targetUserId: 1,
      },
    ];

    taskSpy.deleteTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.deleteTask(1);

    expect(component.tasks.length).toBe(1);
  });
});
