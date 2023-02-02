import { ForbiddenException, Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // check if user exists throw exception
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (userExists) throw new ForbiddenException('Credentials incorrect');
    const hashedPassword = await hash(dto.password);

    // store the user in the database
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: hashedPassword,
      },
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async signin(dto: AuthDto) {
    // get the user by email
    const userFound = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!userFound) throw new ForbiddenException('Credentials incorrect');

    // verify hashed password
    const passwordMatches = await verify(userFound.hash, dto.password);
    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect');

    // return user information
    return {
      id: userFound.id,
      email: userFound.email,
      role: userFound.role,
    };
  }
}
