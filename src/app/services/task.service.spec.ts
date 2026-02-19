import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task, TaskStatus } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8080/api/tasks';
  const historyUrl = 'http://localhost:8080/tasks';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTasks() should call GET with params projectId and status when provided', () => {
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'T1',
        description: 'D1',
        dueDate: null,
        status: 'En cours',
        priority: 'MOYENNE',
        targetUserId: 10,
        project: { id: 9 },
      },
    ];

    service.getTasks({ projectId: 9, status: 'En cours' as TaskStatus }).subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === apiUrl);
    expect(req.request.params.get('projectId')).toBe('9');
    expect(req.request.params.get('status')).toBe('En cours');

    req.flush(mockTasks);
  });

  it('getTasks() should call GET without params when filters not provided', () => {
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual([]);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === apiUrl);
    expect(req.request.params.keys().length).toBe(0);

    req.flush([]);
  });

  it('getTasks() should map error to friendly Error', () => {
    service.getTasks({ projectId: 1 }).subscribe({
      next: () => fail('Expected error'),
      error: (err) => {
        expect(err).toBeTruthy();
        expect(err.message).toContain('Impossible de charger les tâches');
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === apiUrl);
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
  });

  it('createTask() should send payload with project from parentProject if project missing', () => {
    const input: Task = {
      title: 'New',
      description: 'Desc',
      dueDate: null,
      status: 'En attente',
      priority: 'BASSE',
      targetUserId: 10,
      parentProject: { id: 99 },
    };

    service.createTask(input).subscribe((created) => {
      expect(created.title).toBe('New');
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === apiUrl);
    expect(req.request.body.project).toEqual({ id: 99 });
    expect(req.request.body.parentProject).toBeUndefined();

    req.flush({ ...input, id: 123, project: { id: 99 } });
  });

  it('createTask() should map error to friendly Error', () => {
    const input: Task = {
      title: 'New',
      description: 'Desc',
      dueDate: null,
      status: 'En attente',
      priority: 'BASSE',
      targetUserId: 10,
      project: { id: 1 },
    };

    service.createTask(input).subscribe({
      next: () => fail('Expected error'),
      error: (err) => {
        expect(err.message).toContain('Impossible de créer la tâche');
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === apiUrl);
    req.flush({ message: 'fail' }, { status: 400, statusText: 'Bad Request' });
  });

  it('updateTask() should map parentProject into project when project missing', () => {
    service.updateTask(7, { parentProject: { id: 55 } } as any).subscribe((updated) => {
      expect(updated.id).toBe(7);
    });

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${apiUrl}/7`);
    expect(req.request.body.project).toEqual({ id: 55 });
    expect(req.request.body.parentProject).toBeUndefined();

    req.flush({ id: 7 });
  });

  it('updateTask() should map error to friendly Error', () => {
    service.updateTask(7, { title: 'x' }).subscribe({
      next: () => fail('Expected error'),
      error: (err) => {
        expect(err.message).toContain('Impossible de mettre à jour la tâche');
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${apiUrl}/7`);
    req.flush({ message: 'fail' }, { status: 500, statusText: 'Server Error' });
  });

  it('deleteTask() should call DELETE and complete', () => {
    service.deleteTask(8).subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${apiUrl}/8`);
    req.flush(null);
  });

  it('deleteTask() should map error to friendly Error', () => {
    service.deleteTask(8).subscribe({
      next: () => fail('Expected error'),
      error: (err) => {
        expect(err.message).toContain('Impossible de supprimer la tâche');
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${apiUrl}/8`);
    req.flush({ message: 'fail' }, { status: 500, statusText: 'Server Error' });
  });

  it('getTaskHistory() should call history endpoint and return list', () => {
    service.getTaskHistory(3).subscribe((history) => {
      expect(history).toEqual([{ id: 1 }]);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${historyUrl}/3/history`);
    req.flush([{ id: 1 }]);
  });

  it('getTaskHistory() should map error to friendly Error', () => {
    service.getTaskHistory(3).subscribe({
      next: () => fail('Expected error'),
      error: (err) => {
        expect(err.message).toContain("Impossible de charger l’historique");
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${historyUrl}/3/history`);
    req.flush({ message: 'fail' }, { status: 500, statusText: 'Server Error' });
  });
});
