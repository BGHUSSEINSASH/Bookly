import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @ApiProperty({ example: 'Passw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'كلمة المرور يجب أن تحتوي على حرف ورقم على الأقل',
  })
  password: string;

  @ApiProperty({ example: 'محمد أحمد' })
  @IsString()
  @MinLength(2, { message: 'الاسم قصير جدًا' })
  fullName: string;

  @ApiPropertyOptional({ example: '+9647700000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['ar', 'en'], default: 'ar' })
  @IsOptional()
  @IsIn(['ar', 'en'])
  locale?: string;

  @ApiPropertyOptional({ enum: ['IQD', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'EGP', 'USD', 'EUR'] })
  @IsOptional()
  @IsString()
  preferredCurrency?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
