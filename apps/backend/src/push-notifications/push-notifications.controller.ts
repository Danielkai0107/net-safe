import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { JwtAppAuthGuard } from '../app-auth/guards/jwt-app-auth.guard';
import { RegisterTokenDto } from './dto/register-token.dto';

@Controller('app/push')
@UseGuards(JwtAppAuthGuard)
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @Post('register')
  async registerToken(@Request() req, @Body() registerTokenDto: RegisterTokenDto) {
    const result = await this.pushNotificationsService.registerToken(
      req.user.userId,
      registerTokenDto,
    );
    return {
      data: result,
      message: 'Push token registered successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('token/:token')
  async removeToken(@Param('token') token: string) {
    const result = await this.pushNotificationsService.removeToken(token);
    return {
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
