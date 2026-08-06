import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class GuestLoginDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Ten phai co it nhat 2 ky tu' })
  @MaxLength(30, { message: 'Ten khong duoc vuot qua 30 ky tu' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Ten chi duoc dung chu cai, dau tieng Viet va khoang trang',
  })
  displayName?: string;
}
