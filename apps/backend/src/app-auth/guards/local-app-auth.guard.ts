import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAppAuthGuard extends AuthGuard('local-app') {}
