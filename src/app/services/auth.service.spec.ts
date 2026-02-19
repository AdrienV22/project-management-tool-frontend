import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const API = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    spyOn(console, 'error');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET projects (success)', () => {
    let result: any;

    service.getProjects().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}`);
    expect(req.request.method).toBe('GET');

    req.flush([{ id: 1, name: 'P1' }]);

    expect(result).toBeTruthy();
  });

  it('should handle GET projects error', () => {
    let receivedError: any;

    service.getProjects().subscribe({
      next: () => fail('should error'),
      error: (err) => (receivedError = err),
    });

    const req = httpMock.expectOne(`${API}`);
    expect(req.request.method).toBe('GET');

    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(receivedError).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });

  it('should PUT addUserToProject with params', () => {
    service.addUserToProject(10, 'u2.member@test.com', 'MEMBRE').subscribe();

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${API}/10/users`);
    expect(req.request.params.get('userEmail')).toBe('u2.member@test.com');
    expect(req.request.params.get('role')).toBe('MEMBRE');

    req.flush({ ok: true });
  });

  it('should handle addUserToProject error', () => {
    let receivedError: any;

    service.addUserToProject(10, 'u2.member@test.com', 'MEMBRE').subscribe({
      next: () => fail('should error'),
      error: (err) => (receivedError = err),
    });

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${API}/10/users`);
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(receivedError).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });
});
