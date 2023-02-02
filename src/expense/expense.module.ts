import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';

@Module({
  providers: [ExpenseService],
  controllers: [ExpenseController],
})
export class ExpenseModule {}
