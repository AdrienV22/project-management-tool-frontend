import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TaskListComponent } from './task-list.component';
import { TaskService, Task } from '../../services/task.service';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'T1',
      description: 'D1',
      dueDate: '2026-02-17',
      status: 'En attente',
      priority: 'MOYENNE',
      assigneeEmail: 'alice@example.com',
      targetUserId: 26,
    } as any,
    {
      id: 2,
      title: 'T2',
      description: 'D2',
      dueDate: '2026-02-18',
      status: 'En cours',
      priority: 'HAUTE',
      assigneeEmail: 'bob@example.com',
      targetUserId: 26,
    } as any,
  ];

  beforeEach(async () => {
    taskService = jasmine.createSpyObj<TaskService>('TaskService', [
      'getTasks',
      'createTask',
      'assignTaskToUser',
      'updateTask',
      'deleteTask',
      'getTaskHistory',
    ]);

    // évite le bruit console lors des tests d'erreur
    spyOn(console, 'error');

    // valeurs par défaut
    taskService.getTasks.and.returnValue(of(mockTasks));
    taskService.createTask.and.callFake((t: any) => of({ ...t, id: 999 } as any));
    taskService.assignTaskToUser.and.returnValue(of(void 0));
    taskService.updateTask.and.callFake((t: any) => of({ ...t } as any));
    taskService.deleteTask.and.returnValue(of(void 0));
    taskService.getTaskHistory.and.returnValue(of([{ action: 'CREATED' }]));

    await TestBed.configureTestingModule({
      imports: [TaskListComponent], // standalone
      providers: [{ provide: TaskService, useValue: taskService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create + init should load tasks and members and reset newTask', () => {
    fixture.detectChanges(); // déclenche ngOnInit

    expect(component).toBeTruthy();

    expect(taskService.getTasks).toHaveBeenCalledWith(component.userId, component.projectId);
    expect(component.tasks.length).toBe(2);

    expect(component.projectMembers.length).toBeGreaterThan(0);

    // newTask initialisé
    expect(component.newTask).toBeTruthy();
    expect(component.newTask.status).toBe('En attente');
    expect(component.newTask.parentProject?.id).toBe(component.projectId);
    expect(component.newTask.targetUserId).toBe(component.userId);
  });

  it('loadTasks should set errorMessage on error', () => {
    taskService.getTasks.and.returnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges(); // ngOnInit -> loadTasks

    expect(component.errorMessage).toBe('Impossible de charger les tâches.');
    expect(console.error).toHaveBeenCalled();
  });

  it('createTask should push created task + set successMessage and reset form', () => {
    fixture.detectChanges();
    component.tasks = [];

    component.newTask.title = 'Nouvelle tâche';
    component.newTask.description = 'Desc';
    component.newTask.dueDate = '2026-02-20';

    component.createTask();

    expect(taskService.createTask).toHaveBeenCalled();
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].id).toBe(999);

    expect(component.successMessage).toBe('Tâche créée avec succès !');
    expect(component.errorMessage).toBe('');

    // resetNewTask repasse les valeurs par défaut
    expect(component.newTask.title).toBe('');
    expect(component.newTask.status).toBe('En attente');
  });

  it('createTask should set errorMessage on error', () => {
    fixture.detectChanges();
    taskService.createTask.and.returnValue(throwError(() => ({ status: 400 })));

    component.createTask();

    expect(component.errorMessage).toBe('Impossible de créer la tâche.');
    expect(component.successMessage).toBe('');
    expect(console.error).toHaveBeenCalled();
  });

  it('assignTask should early return if no id or no assigneeEmail', () => {
    fixture.detectChanges();

    component.assignTask({ title: 'x' } as any);
    component.assignTask({ id: 1, title: 'x' } as any);

    expect(taskService.assignTaskToUser).not.toHaveBeenCalled();
  });

  it('assignTask success should set successMessage', () => {
    fixture.detectChanges();

    const task = { id: 10, assigneeEmail: 'alice@example.com' } as any;
    component.assignTask(task);

    expect(taskService.assignTaskToUser).toHaveBeenCalledWith(10, 'alice@example.com');
    expect(component.successMessage).toContain('Tâche assignée à alice@example.com');
    expect(component.errorMessage).toBe('');
  });

  it('assignTask error should set errorMessage', () => {
    fixture.detectChanges();
    taskService.assignTaskToUser.and.returnValue(throwError(() => ({ status: 500 })));

    const task = { id: 10, assigneeEmail: 'alice@example.com' } as any;
    component.assignTask(task);

    expect(component.errorMessage).toBe('Erreur lors de l’assignation de la tâche');
    expect(component.successMessage).toBe('');
  });

  it('startEditing / cancelEditing should work', () => {
    fixture.detectChanges();

    const t = mockTasks[0];
    component.startEditing(t);
    expect(component.editingTask).toBeTruthy();
    expect(component.editingTask).not.toBe(t); // copie

    component.cancelEditing();
    expect(component.editingTask).toBeNull();
  });

  it('updateTask should do nothing if editingTask is null', () => {
    fixture.detectChanges();

    component.editingTask = null;
    component.updateTask();

    expect(taskService.updateTask).not.toHaveBeenCalled();
  });

  it('updateTask success should replace task when found, clear editingTask, set success', () => {
    fixture.detectChanges();
    component.tasks = [...mockTasks];

    component.startEditing(mockTasks[0]);
    component.editingTask!.title = 'UPDATED';

    component.updateTask();

    expect(taskService.updateTask).toHaveBeenCalled();
    expect(component.tasks[0].title).toBe('UPDATED');
    expect(component.successMessage).toBe('Tâche mise à jour avec succès.');
    expect(component.errorMessage).toBe('');
    expect(component.editingTask).toBeNull();
  });

  it('updateTask success should NOT replace if task not found (index === -1)', () => {
    fixture.detectChanges();
    component.tasks = [...mockTasks];

    component.editingTask = { id: 9999, title: 'X' } as any;
    component.updateTask();

    expect(taskService.updateTask).toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
    expect(component.successMessage).toBe('Tâche mise à jour avec succès.');
    expect(component.editingTask).toBeNull();
  });

  it('updateTask error should set errorMessage', () => {
    fixture.detectChanges();
    component.tasks = [...mockTasks];
    component.editingTask = { ...mockTasks[0] };

    taskService.updateTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.updateTask();

    expect(component.errorMessage).toBe('Impossible de mettre à jour la tâche.');
    expect(component.successMessage).toBe('');
    expect(console.error).toHaveBeenCalled();
  });

  it('deleteTask success should remove task and set successMessage', () => {
    fixture.detectChanges();
    component.tasks = [...mockTasks];

    component.deleteTask(1);

    expect(taskService.deleteTask).toHaveBeenCalledWith(1);
    expect(component.tasks.find((t) => t.id === 1)).toBeUndefined();
    expect(component.successMessage).toBe('Tâche supprimée avec succès.');
    expect(component.errorMessage).toBe('');
  });

  it('deleteTask error should set errorMessage', () => {
    fixture.detectChanges();
    component.tasks = [...mockTasks];

    taskService.deleteTask.and.returnValue(throwError(() => ({ status: 500 })));

    component.deleteTask(1);

    expect(component.errorMessage).toBe('Impossible de supprimer la tâche.');
    expect(component.successMessage).toBe('');
    expect(console.error).toHaveBeenCalled();
  });

  it('showHistory should fetch and toggle off when clicked twice', () => {
    fixture.detectChanges();

    component.showHistory(2);
    expect(taskService.getTaskHistory).toHaveBeenCalledWith(2);
    expect(component.visibleHistoryTaskId).toBe(2);
    expect(component.selectedTaskHistory.length).toBeGreaterThan(0);

    // second click -> hide
    component.showHistory(2);
    expect(component.visibleHistoryTaskId).toBeNull();
    expect(component.selectedTaskHistory.length).toBe(0);
  });

  it('showHistory error should set errorMessage', () => {
    fixture.detectChanges();
    taskService.getTaskHistory.and.returnValue(throwError(() => ({ status: 500 })));

    component.showHistory(2);

    expect(component.errorMessage).toBe('Impossible de récupérer l’historique.');
  });

  it('editing getters should return empty string when no editingTask', () => {
    fixture.detectChanges();
    component.editingTask = null;

    expect(component.editingTaskTitle).toBe('');
    expect(component.editingTaskDescription).toBe('');
    expect(component.editingTaskDueDate).toBe('');
    expect(component.editingTaskPriority).toBe('');
    expect(component.editingTaskStatus).toBe('');
  });

  it('editing getters should return values when editingTask exists', () => {
    fixture.detectChanges();
    component.editingTask = {
      title: 'A',
      description: 'B',
      dueDate: '2026-02-20',
      priority: 'BASSE',
      status: 'En cours',
    } as any;

    expect(component.editingTaskTitle).toBe('A');
    expect(component.editingTaskDescription).toBe('B');
    expect(component.editingTaskDueDate).toBe('2026-02-20');
    expect(component.editingTaskPriority).toBe('BASSE');
    expect(component.editingTaskStatus).toBe('En cours');
  });
});
