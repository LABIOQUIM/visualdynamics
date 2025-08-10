"use client";
import { useState } from "react";
import { ActionIcon, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";

import { downloadUserFile } from "@/actions/administration/downloadUserFile";

import { NavCrumb } from "./NavCrumb";

import classes from "./FileManager.module.css";

interface Props {
  files: FileProps[];
  breadcrumbsPrefix?: string;
  breadcrumbsSplitStart?: number;
}

export function FileManager({
  files,
  breadcrumbsPrefix,
  breadcrumbsSplitStart = 0,
}: Props) {
  const [currentLevel, setCurrentLevel] = useState(files);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([""]);

  const handleDoubleClick = async (file: FileProps) => {
    if (file.children) {
      setCurrentLevel(file.children);
      setBreadcrumbs(file.path.split("/").slice(breadcrumbsSplitStart));
    } else {
      const data = await downloadUserFile(file.path);

      const pathSegments = file.path.split("/");

      const link = document.createElement("a");
      link.download = `${pathSegments[pathSegments.length - 1]}`;
      const blobUrl = window.URL.createObjectURL(
        new Blob([new Uint8Array(Buffer.from(data, "base64"))])
      );

      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    }
  };

  function findFileByPath(
    files: FileProps[],
    targetPath: string
  ): FileProps | undefined {
    for (const file of files) {
      if (file.path === targetPath) return file;
      if (file.children) {
        const found = findFileByPath(file.children, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  }

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    let targetPath = newBreadcrumbs.join("/");
    if (breadcrumbsPrefix) {
      targetPath = breadcrumbsPrefix + newBreadcrumbs.join("/");
    }
    const newLevel = findFileByPath(files, targetPath);
    setCurrentLevel(newLevel?.children || []);
  };

  const handleHomeClick = () => {
    setCurrentLevel(files);
    setBreadcrumbs([""]);
  };

  return (
    <div className={classes.mainContainer}>
      <div className={classes.navContainer}>
        <div className={classes.breadcrumbsContainer}>
          <ActionIcon variant="subtle" color="indigo" onClick={handleHomeClick}>
            <IconHome size={20} />
          </ActionIcon>
          <Text className={classes.navText}>/</Text>
          {breadcrumbs.map((crumb, index) => (
            <NavCrumb
              key={`${crumb}-${files[0].path}`}
              crumb={crumb}
              isLastCrumb={index === breadcrumbs.length - 1}
              onClick={() => handleBreadcrumbClick(index)}
            />
          ))}
        </div>
      </div>
      <div className={classes.contentContainer}>
        {currentLevel.map((file) => (
          <Tooltip
            key={file.path}
            label={file.name}
            position="bottom"
            withArrow
          >
            <UnstyledButton
              className={classes.fileContainer}
              onDoubleClick={() => handleDoubleClick(file)}
            >
              <div className={classes.fileIconContainer}>
                {file.children
                  ? "📁"
                  : file.name.endsWith(".png")
                  ? "🏞️"
                  : "📄"}
              </div>

              <Text className={classes.fileName}>{file.name}</Text>
            </UnstyledButton>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
