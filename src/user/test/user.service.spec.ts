import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStub } from '../stubs';
import { UserService } from '../user.service';

jest.mock('../../prisma/prisma.service.ts');

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  it('bootstrap', () => {
    expect(service).toBeDefined();
  });

  describe('getMe()', () => {
    describe('when called', () => {
      let result: User;

      beforeEach(async () => {
        result = await service.getMe(1);
      });

      test('findUnique() should be called', () => {
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: {
            id: UserStub().id,
          },
        });

        expect(prisma.user.findUnique).toHaveReturnedWith(
          Promise.resolve(UserStub()),
        );
      });

      it('should return user', () => {
        const _user = UserStub();
        delete _user.hash;
        expect(result).toMatchObject(_user);
      });
    });
  });
});
