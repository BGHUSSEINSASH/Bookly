import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CreateTicketDto {
  @IsString() subject: string;
  @IsString() message: string;
  @IsOptional() @IsIn(['GENERAL', 'BOOKING', 'PAYMENT', 'TECHNICAL', 'COMPLAINT']) category?: string;
  @IsOptional() @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority?: string;
}

class ReplyDto {
  @IsString() body: string;
}

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'تذاكر الدعم' })
  async tickets(@CurrentUser('id') userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  @Get('tickets/:id')
  async ticket(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.supportTicket.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  @Post('tickets')
  @ApiOperation({ summary: 'فتح تذكرة دعم' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        category: dto.category ?? 'GENERAL',
        priority: dto.priority ?? 'NORMAL',
        messages: { create: { senderId: userId, body: dto.message } },
      },
      include: { messages: true },
    });
  }

  @Post('tickets/:id/reply')
  @ApiOperation({ summary: 'الرد على تذكرة' })
  async reply(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ReplyDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة');

    // المالك أو فريق الدعم فقط
    if (ticket.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      const isStaff =
        user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
      if (!isStaff) throw new ForbiddenException('لا تملك صلاحية الرد على هذه التذكرة');
    }

    await this.prisma.supportMessage.create({
      data: { ticketId: id, senderId: userId, body: dto.body },
    });
    await this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'IN_PROGRESS', updatedAt: new Date() },
    });
    return { message: 'تم إرسال الرد' };
  }
}
