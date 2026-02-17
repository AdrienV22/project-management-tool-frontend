import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { TaskComponent } from './task.component';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  let taskService: jasmine.SpyObj<TaskService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const sampleTasks: Task[] = [
    { id: 1, title: 'A', description: 'd', dueDate: '2026-01-01', status: 'New', priority: 'MOYENNE', targetUserId: 1 },
    { id: 2, title: 'B', description: 'd', dueDate: '2026-01-02', status: 'Done', priority: 'MOYENNE', targetUserId: 1 },
  ];

  beforeEach(async () => {
    // évite le bruit console des branches error
    spyOn(console, 'error');
    spyOn(console, 'log');

    taskService = jasmine.createSpyObj<TaskService>('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask',
    ]);

    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getUserId']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    // default: user connecté
    authService.getUserId.and.returnValue(26);

    // default: getTasks ok
    taskService.getTasks.and.returnValue(of(sampleTasks));
    taskService.createTask.and.callFake((t: Task) => of({ ...t, id: 99 }));
    taskService.updateTask.and.callFake((t: Task) => of({ ...t }));
    taskService.deleteTask.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [TaskComponent], // standalone
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit -> loadTasks()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load tasks (success)', () => {
    expect(taskService.getTasks).toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
    expect(component.tasks[0].id).toBe(1);
  });

  it('loadTasks should handle error', () => {
    taskService.getTasks.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadTasks();

    expect(console.error).toHaveBeenCalled();
  });

  it('getTasksByStatus should filter tasks by status', () => {
    component.tasks = sampleTasks;

    const res = component.getTasksByStatus('Done');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(2);
  });

  it('onSubmit should NOT create task if user is not logged in', () => {
    authService.getUserId.and.returnValue(0);

    component.task = {
      id: 0,
      title: 'X',
      description: 'Y',
      dueDate: '2026-02-02',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    component.onSubmit();

    expect(taskService.createTask).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled(); // "Utilisateur non connecté"
  });

  it('onSubmit should create task and reset form (success)', () => {
    component.tasks = [...sampleTasks];

    component.task = {
      id: 0,
      title: 'New task',
      description: 'desc',
      dueDate: '2026-02-10',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    component.onSubmit();

    expect(taskService.createTask).toHaveBeenCalled();

    // la tâche créée est push
    expect(component.tasks.length).toBe(3);
    expect(component.tasks[2].id).toBe(99);

    // le form est reset
    expect(component.task.title).toBe('');
    expect(component.task.status).toBe('New');
  });

  it('onSubmit should handle createTask error', () => {
    taskService.createTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.task = {
      id: 0,
      title: 'fail',
      description: 'desc',
      dueDate: '2026-02-10',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    component.onSubmit();

    expect(taskService.createTask).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('resetTaskForm should set targetUserId from AuthService (fallback 1 if null)', () => {
    authService.getUserId.and.returnValue(42);
    component.resetTaskForm();
    expect(component.task.targetUserId).toBe(42);

    authService.getUserId.and.returnValue(null as any);
    component.resetTaskForm();
    expect(component.task.targetUserId).toBe(1);
  });

  it('editTask should open modal and clone task', () => {
    component.showEditModal = false;

    const t: Task = { id: 7, title: 'E', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: 1 };
    component.editTask(t);

    expect(component.showEditModal).toBeTrue();
    expect(component.editingTask.id).toBe(7);

    // clone (pas même référence)
    expect(component.editingTask).not.toBe(t);
  });

  it('closeEditModal should close modal and reset editingTask', () => {
    component.showEditModal = true;
    component.editingTask = { id: 7, title: 'E', description: 'x', dueDate: 'd', status: 'Done', priority: 'MOYENNE', targetUserId: 26 };

    component.closeEditModal();

    expect(component.showEditModal).toBeFalse();
    expect(component.editingTask.id).toBe(0);
    expect(component.editingTask.title).toBe('');
    expect(component.editingTask.status).toBe('New');
  });

  it('updateTask should update list and close modal (success)', () => {
    component.tasks = [
      { id: 1, title: 'Old', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: 1 },
    ];
    component.showEditModal = true;
    component.editingTask = { ...component.tasks[0], title: 'Updated' };

    // IMPORTANT: garder une copie AVANT (closeEditModal reset editingTask)
    const expectedArg = { ...component.editingTask };

    component.updateTask();

    expect(taskService.updateTask).toHaveBeenCalledWith(expectedArg);
    expect(component.tasks[0].title).toBe('Updated');
    expect(component.showEditModal).toBeFalse();
    expect(component.editingTask.id).toBe(0); // reset fait par closeEditModal
  });

  it('updateTask should do nothing if editingTask has no id', () => {
    component.editingTask = {
      id: 0,
      title: 'No id',
      description: '',
      dueDate: '',
      status: 'New',
      priority: 'MOYENNE',
      targetUserId: 1,
    };

    component.updateTask();

    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  it('updateTask should handle error', () => {
    taskService.updateTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.tasks = [
      { id: 1, title: 'Old', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: 1 },
    ];
    component.showEditModal = true;
    component.editingTask = { ...component.tasks[0], title: 'Updated' };

    component.updateTask();

    expect(taskService.updateTask).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('onDrop should update status + call updateTask when task exists', () => {
    component.tasks = [
      { id: 1, title: 'A', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: 1 },
    ];

    const event = {
      item: { data: { id: 1 } },
    } as unknown as CdkDragDrop<Task[]>;

    component.onDrop(event, 'Done');

    expect(taskService.updateTask).toHaveBeenCalled();
    expect(component.tasks[0].status).toBe('Done');
  });

  it('onDrop should do nothing if taskId is falsy', () => {
    component.tasks = [...sampleTasks];

    const event = {
      item: { data: { id: 0 } },
    } as unknown as CdkDragDrop<Task[]>;

    component.onDrop(event, 'Done');

    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  it('onDrop should handle update error', () => {
    taskService.updateTask.and.returnValue(throwError(() => ({ status: 500 })));
    component.tasks = [
      { id: 1, title: 'A', description: '', dueDate: '', status: 'New', priority: 'MOYENNE', targetUserId: 1 },
    ];

    const event = {
      item: { data: { id: 1 } },
    } as unknown as CdkDragDrop<Task[]>;

    component.onDrop(event, 'Done');

    expect(taskService.updateTask).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('deleteTask should NOT call service when confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.tasks = [...sampleTasks];
    component.deleteTask(1);

    expect(taskService.deleteTask).not.toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
  });

  it('deleteTask should call service and remove task when confirm is true', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.tasks = [...sampleTasks];
    component.deleteTask(1);

    expect(taskService.deleteTask).toHaveBeenCalledWith(1);
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].id).toBe(2);
  });

  it('deleteTask should handle delete error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    taskService.deleteTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.tasks = [...sampleTasks];
    component.deleteTask(1);

    expect(taskService.deleteTask).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalled();
    // la tâche n’est pas supprimée si erreur
    expect(component.tasks.length).toBe(2);
  });
});
