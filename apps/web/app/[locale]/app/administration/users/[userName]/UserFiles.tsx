"use client";
import { Alert, Text, Title } from "@mantine/core";
import { IconFileOff } from "@tabler/icons-react";

import { FileManager } from "@/components/FileManager/FileManager";
import { Heading } from "@/components/Heading/Heading";
import { Loader } from "@/components/Loader/Loader";
import { useUserFileTree } from "@/hooks/administration/useUserFileTree";

import classes from "./page.module.css";

interface Props {
  userName: string;
}

export function UserFiles({ userName }: Props) {
  const { data, isLoading } = useUserFileTree(userName);

  if (isLoading) {
    return (
      <div className={classes.noFilesContainer}>
        <Loader />
      </div>
    );
  }

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
        <Heading title="File Browser" />
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
        <FileManager
          breadcrumbsPrefix={`/files/${userName}/`}
          breadcrumbsSplitStart={3}
          files={data[0].children || []}
        />
      )}
    </div>
  );
}
