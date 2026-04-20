import type { PropsWithChildren } from "react";
import { Box, Title } from "@mantine/core";

interface Props {
  title: string;
}

export function SectionContainer({
  title,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Box>
      <Title mb="xs" order={5}>
        {title}
      </Title>
      {children}
    </Box>
  );
}
