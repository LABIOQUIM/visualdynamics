import { Controller, Post } from "@nestjs/common";
import { Roles, Session } from "@thallesp/nestjs-better-auth";

import { auth } from "../lib/auth.js";
import { PrismaService } from "../prisma.service.js";

@Controller("admin")
@Roles(["admin"])
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post("force-password-reset-all")
  async forcePasswordResetAll(
    @Session() _session: typeof auth.$Infer.Session,
  ) {
    const nonAdminFilter = { role: { not: "admin" } };

    const users = await this.prisma.user.findMany({
      where: nonAdminFilter,
      select: { id: true },
    });

    await this.prisma.user.updateMany({
      where: nonAdminFilter,
      data: { requirePasswordChange: true },
    });

    await this.prisma.session.deleteMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });

    return { affected: users.length };
  }
}
