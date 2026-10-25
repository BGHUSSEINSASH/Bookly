import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('me')
  @ApiOperation({ summary: 'رصيد النقاط والمستوى' })
  me(@CurrentUser('id') userId: string) {
    return this.loyaltyService.summary(userId);
  }
}
