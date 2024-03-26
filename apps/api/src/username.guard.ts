import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class UsernameGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userName = this.extractUsernameFromHeader(request);
    if (!userName) {
      throw new UnauthorizedException();
    }
    try {
      request.userName = userName;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractUsernameFromHeader(request: Request): string {
    return request.headers["x-username"] as string;
  }
}
