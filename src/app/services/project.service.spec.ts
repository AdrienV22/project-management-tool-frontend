import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProjects() should GET projects', () => {
    service.getProjects().subscribe((projects) => {
      expect(projects.length).toBe(2);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === apiUrl);
    req.flush([{ id: 1 }, { id: 2 }]);
  });

  it('getProjects() should map error to friendly Error', () => {
    service.getProjects().subscribe({
      next: () => fail('Expected error'),
      error: (err) => expect(err.message).toContain('Erreur de récupération des projets'),
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === apiUrl);
    req.flush({ message: 'fail' }, { status: 500, statusText: 'Server Error' });
  });

  it('addProject() should POST project with JSON header', () => {
    const project = { name: 'P1' };

    service.addProject(project).subscribe((res) => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === apiUrl);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(project);

    req.flush({ id: 1, name: 'P1' });
  });

  it('addProject() should map error to friendly Error', () => {
    service.addProject({ name: 'P1' }).subscribe({
      next: () => fail('Expected error'),
      error: (err) => expect(err.message).toContain("Erreur lors de l'ajout du projet"),
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url === apiUrl);
    req.flush({ message: 'fail' }, { status: 400, statusText: 'Bad Request' });
  });

  it('getProjectById() should GET /{id}', () => {
    service.getProjectById(7).subscribe((res) => {
      expect(res.id).toBe(7);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${apiUrl}/7`);
    req.flush({ id: 7 });
  });

  it('updateProject() should PUT /{id} with JSON header', () => {
    service.updateProject(5, { name: 'X' }).subscribe((res) => {
      expect(res.ok).toBeTrue();
    });

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${apiUrl}/5`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual({ name: 'X' });

    req.flush({ ok: true });
  });

  it('deleteProject() should DELETE /{id}', () => {
    service.deleteProject(3).subscribe((res) => {
      expect(res.ok).toBeTrue();
    });

    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${apiUrl}/3`);
    req.flush({ ok: true });
  });

  it('addUserToProject() should PUT /{id}/users with email + role', () => {
    service.addUserToProject(9, 'a@b.com', 'ADMIN').subscribe((res) => {
      expect(res.ok).toBeTrue();
    });

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${apiUrl}/9/users`);
    expect(req.request.body).toEqual({ email: 'a@b.com', role: 'ADMIN' });

    req.flush({ ok: true });
  });

  it('getProjectMembers() should GET /{id}/users', () => {
    service.getProjectMembers(9).subscribe((members) => {
      expect(members).toEqual([{ id: 1 }, { id: 2 }]);
    });

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${apiUrl}/9/users`);
    req.flush([{ id: 1 }, { id: 2 }]);
  });
});
