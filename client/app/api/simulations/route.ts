import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const body =
    (await request.json()) as unknown as Prisma.SimulationUpdateInput & {
      userEmail?: string;
      username?: string;
    };

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: body.userEmail }, { username: body.username }]
    }
  });

  if (!user) {
    return NextResponse.json({
      message: "no-user"
    });
  }

  const userLastSim = await prisma.simulation.findFirst({
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!userLastSim) {
    return NextResponse.json({
      message: "no-simulation"
    });
  }

  await prisma.simulation.update({
    where: {
      id: userLastSim.id
    },
    data: {
      erroredOnCommand: body.erroredOnCommand ?? userLastSim.erroredOnCommand,
      startedAt: body.startedAt
        ? dayjs(body.startedAt as string).toDate()
        : userLastSim.startedAt,
      endedAt: body.endedAt
        ? dayjs(body.endedAt as string).toDate()
        : userLastSim.endedAt,
      status: body.status ?? userLastSim.status
    }
  });

  return NextResponse.json({
    message: "updated"
  });
}
