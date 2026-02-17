import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // évite le bruit console des paths error du service
    spyOn(console, 'error');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET tasks (success)', () => {
    let result: any;

    service.getTasks().subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.method === 'GET');
    req.flush([{ id: 1, title: 'T1' }]);

    expect(result).toBeTruthy();
  });

  it('should handle GET tasks error (server error path)', () => {
    let receivedError: any;

    service.getTasks().subscribe({
      next: () => fail('should error'),
      error: (err) => (receivedError = err),
    });

    const req = httpMock.expectOne((r) => r.method === 'GET');
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    // Le service peut transformer l'erreur (et perdre le status).
    // On valide donc :
    // - qu'on est bien passé dans le handler d'erreur
    // - que le service a loggé l'erreur (si ton code le fait)
    expect(receivedError).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });
});
