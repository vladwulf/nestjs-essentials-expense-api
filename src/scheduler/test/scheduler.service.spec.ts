import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersWithExpensesStub } from '../../user/stubs';
import { SchedulerService } from '../scheduler.service';

jest.mock('../../prisma/prisma.service.ts');

describe('SchedulerService', () => {
  let service: SchedulerService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [SchedulerService, PrismaService],
    }).compile();

    service = module.get(SchedulerService);
  });

  it('bootstrap', () => {
    expect(service).toBeDefined();
  });

  describe('getExpensesSum()', () => {
    describe('when called', () => {
      let result: number;
      beforeEach(() => {
        result = service.getExpensesSum(UsersWithExpensesStub()[0].expenses);
      });

      it('should return sum', () => {
        expect(result).toEqual(170);
      });
    });
  });
});
