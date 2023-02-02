import { Injectable } from '@nestjs/common';

@Injectable()
export class SimpleService {
  testMe(value: number) {
    return value + 1;
  }

  testMeWithMocks(value: number) {
    const randomValue = this.genRandom();
    return randomValue + value;
  }

  genRandom() {
    return Math.round(Math.random() * 100);
  }
}
