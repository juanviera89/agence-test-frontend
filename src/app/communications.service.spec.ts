import { TestBed, inject } from '@angular/core/testing';

import { CommunicationsService } from './communications.service';

describe('CommunicationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommunicationsService]
    });
  });

  it('should be created', inject([CommunicationsService], (service: CommunicationsService) => {
    expect(service).toBeTruthy();
  }));
});
