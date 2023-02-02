import { Expense, Role } from '@prisma/client';

const date = new Date();

export const UserStub = () => ({
  id: 1,
  email: 'test@gmail.com',
  hash: 'huafhkeaufh',
  currentBalance: 2000,
  initialBalance: 2000,
  role: Role.USER,
  createdAt: date,
  updatedAt: date,
});

export const UsersWithExpensesStub = () => [
  {
    id: 1,
    email: 'test@gmail.com',
    hash: 'huafhkeaufh',
    currentBalance: 2000,
    initialBalance: 2000,
    role: Role.USER,
    createdAt: date,
    updatedAt: date,
    expenses: [
      {
        id: 1,
        amount: '100',
      },
      {
        id: 2,
        amount: '20',
      },
      {
        id: 2,
        amount: '50',
      },
    ] as Expense[],
  },
];
