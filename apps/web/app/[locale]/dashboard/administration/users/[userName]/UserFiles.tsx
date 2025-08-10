"use client";
import { ActionIcon, Alert, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconFileOff } from "@tabler/icons-react";
import Link from "next/link";

import { FileManager } from "@/components/FileManager/FileManager";
import { useUserFileTree } from "@/hooks/administration/useUserFileTree";

import classes from "./page.module.css";

interface Props {
  userName: string;
}

export function UserFiles({ userName }: Props) {
  const { data } = useUserFileTree(userName);

  if (!data || data === "unauthenticated" || data === "unauthorized") {
    return (
      <div className={classes.noFilesContainer}>
        <IconFileOff size={96} />
        <Title>No Files Found</Title>
      </div>
    );
  }

  return (
    <div className={classes.fileBrowserContainer}>
      <div className={classes.fileBrowserSideContainer}>
        <div className={classes.fileBrowserSideHeader}>
          <Link href="/dashboard/administration/users">
            <ActionIcon variant="subtle" aria-label="Settings">
              <IconArrowLeft
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            </ActionIcon>
          </Link>
          <Title order={2}>File Browser</Title>
        </div>
        <Text>
          Viewing files of <strong>{userName}</strong>
        </Text>
        <Alert
          className={classes.infoContainer}
          variant="light"
          color="blue"
          title="Folders"
        >
          <Text>
            You can enter <strong>folders</strong> by double-clicking on them.
          </Text>
        </Alert>
        <Alert
          className={classes.infoContainer}
          variant="light"
          color="blue"
          title="Files"
        >
          <Text>
            You can <strong>download files</strong> by double-clicking on them.
          </Text>
        </Alert>
        <Alert
          className={classes.infoContainer}
          variant="light"
          color="blue"
          title="Need to get back?"
        >
          <Text>
            You can <strong>go back</strong> by clicking on the folder you want
            on the top bar.
          </Text>
        </Alert>
      </div>
      {!data[0].path ? (
        <div className={classes.noFilesContainer}>
          <IconFileOff size={96} />
          <Title>No Files Found</Title>
        </div>
      ) : (
        <FileManager files={data} />
      )}
    </div>
  );
}
