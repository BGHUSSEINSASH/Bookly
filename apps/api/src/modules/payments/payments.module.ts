import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ZainCashService } from './zaincash.service';
import { FastPayService } from './fastpay.service';
import { StripeService } from './stripe.service';
import { WalletModule } from '../wallet/wallet.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [WalletModule],
  controllers: [PaymentsController],
  providers: [ZainCashService, FastPayService, StripeService],
  exports: [ZainCashService, FastPayService, StripeService],
})
export class PaymentsModule {}
