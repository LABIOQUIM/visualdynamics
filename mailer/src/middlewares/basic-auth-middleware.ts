import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class BasicAuthMiddleware implements NestMiddleware {
  private readonly username = process.env.DASHBOARD_USERNAME;
  private readonly password = process.env.DASHBOARD_PASSWORD;
  private readonly encodedCredentials = Buffer.from(
    this.username + ':' + this.password,
  ).toString('base64');

  use(req: Request, res: Response, next: NextFunction) {
    const reqCredentials =
      req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (!reqCredentials || reqCredentials !== this.encodedCredentials) {
      res.setHeader(
        'WWW-Authenticate',
        'Basic realm="simple-mail", charset="UTF-8"',
      );
      res.sendStatus(401);
    } else {
      next();
    }
  }
}
