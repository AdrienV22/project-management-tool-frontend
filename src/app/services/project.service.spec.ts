import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

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

    const req = httpMock.expectOne((r) => r.method === 'GET');
    req.flush([{ id: 1, name: 'P1' }]);

    expect(result).toBeTruthy();
  });

  it('should handle GET projects error (server error path)', () => {
    let receivedError: any;

    service.getProjects().subscribe({
      next: () => fail('should error'),
      error: (err) => (receivedError = err),
    });

    const req = httpMock.expectOne((r) => r.method === 'GET');
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(receivedError).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });
});
