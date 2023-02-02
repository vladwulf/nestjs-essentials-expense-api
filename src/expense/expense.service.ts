import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginateDto, PaginateResultDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async getAllUserExpenses(
    userId: number,
    paginate: PaginateDto,
  ): Promise<PaginateResultDto> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
      },
      take: paginate.limit,
      skip: paginate.offset,
    });

    const count = await this.prisma.expense.count({
      where: {
        userId,
      },
    });

    return {
      data: expenses,
      count,
      hasMore: count > paginate.limit + paginate.offset,
    };
  }

  async getUserExpenseById(userId: number, expenseId: number) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (!expense) throw new NotFoundException('Resource does not exist');
    if (expense.userId !== userId)
      throw new ForbiddenException('Access to resource unauthorized');

    return expense;
  }

  async createExpense(userId: number, dto: CreateExpenseDto) {
    const newExpense = await this.prisma.expense.create({
      data: {
        ...dto,
        userId,
      },
    });
    return newExpense;
  }

  async updateUserExpenseById(
    userId: number,
    expenseId: number,
    dto: UpdateExpenseDto,
  ) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
      },
    });
    if (!expense) throw new NotFoundException('Resource does not exist');
    if (expense.userId !== userId)
      throw new ForbiddenException('Access to resource unauthorized');

    const updatedExpense = await this.prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: dto,
    });
    return updatedExpense;
  }

  async deleteUserExpenseById(userId: number, expenseId: number) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
      },
    });
    if (!expense) throw new NotFoundException('Resource does not exist');
    if (expense.userId !== userId)
      throw new ForbiddenException('Access to resource unauthorized');

    await this.prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return expense;
  }
}
