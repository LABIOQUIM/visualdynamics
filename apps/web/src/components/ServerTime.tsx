import classes from "./ServerTime.module.css";

import { ActionIcon, Popover, Text, Title } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { dateFormatWithSecs } from "@/lib/utils";

export function ServerTime() {
  const [serverTime, updateServerTime] = useState<Date>(new Date());

  useEffect(() => {
    const id = setTimeout(() => updateServerTime(new Date()), 1000);
    return () => clearTimeout(id);
  }, [serverTime]);

  return (
    <Popover position="bottom-end" shadow="md" width={260}>
      <Popover.Target>
        <ActionIcon color="gray" size="lg" variant="subtle">
          <IconClock size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown className={classes.dropdown}>
        <Title order={6} mb={4}>
          Server time
        </Title>
        <Text>{dateFormatWithSecs(serverTime)}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}
