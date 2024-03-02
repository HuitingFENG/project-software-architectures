import { Test, TestingModule } from '@nestjs/testing';
import { TokenSessionService } from './token-session.service';

describe('TokenSessionService', () => {
  let service: TokenSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenSessionService],
    }).compile();

    service = module.get<TokenSessionService>(TokenSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
