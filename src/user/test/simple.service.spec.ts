import { Test } from '@nestjs/testing';
import { SimpleService } from '../simple.service';

describe('SimpleService', () => {
  let service: SimpleService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [SimpleService],
    }).compile();

    service = module.get(SimpleService);
  });

  it('bootstrap', () => {
    expect(service).toBeDefined();
  });

  describe('testMe()', () => {
    describe('when called', () => {
      let result;

      beforeEach(() => {
        result = service.testMe(5);
      });

      it('should return a number', () => {
        expect(typeof result).toBe('number');
      });

      it('should return a number + 1', () => {
        expect(result).toBe(6);
      });
    });
  });

  describe('testMeWithMocks()', () => {
    describe('when called', () => {
      let result;

      beforeEach(() => {
        jest.spyOn(service, 'genRandom').mockReturnValue(2);
        result = service.testMeWithMocks(5);
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      test('getRandom() should be called', () => {
        expect(service.genRandom).toHaveBeenCalled();
        expect(service.genRandom).toHaveReturnedWith(2);
      });

      it('should return a number', () => {
        expect(typeof result).toBe('number');
      });

      it('should return a number + 2', () => {
        expect(result).toBe(7);
      });
    });
  });
});
