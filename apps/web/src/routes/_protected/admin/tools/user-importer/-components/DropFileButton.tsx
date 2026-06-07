import classes from "./DropFileButton.module.css";

import { usePapaParse } from "react-papaparse";
import { Button, Group, Text } from "@mantine/core";
import { Dropzone, type FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { IconCloudUpload, IconDownload, IconX } from "@tabler/icons-react";
import { useCallback, useRef } from "react";

import { type ImporterUser, useUserImporter } from "./Provider";

type ImportedUser = {
  created_at: string;
  updated_at: string;
  email: string;
  user_name: string;
  first_name: string;
  last_name: string;
  role: string;
};

export function DropFileButton() {
  const { readString } = usePapaParse();
  const { setUsers } = useUserImporter();

  const openRef = useRef<() => void>(null);

  const onDrop = useCallback(async (files: FileWithPath[]) => {
    if (!files.length) return;

    const file = files[0];

    const csvText = await file.text();

    readString(csvText, {
      header: true,
      complete: (results) => {
        const data = results.data as ImportedUser[];

        const newUsers: ImporterUser[] = data.map((u) => ({
          createdAt: u.created_at,
          updatedAt: u.updated_at,
          email: u.email,
          username: u.user_name,
          name: `${u.first_name} ${u.last_name}`,
          role: u.role ? u.role.toLowerCase() : "user",
        }));

        setUsers(newUsers);
      },
    });
  }, []);

  return (
    <div className={classes.wrapper}>
      <Dropzone
        accept={[MIME_TYPES.csv]}
        aria-label="Drop files here"
        className={classes.dropzone}
        maxSize={30 * 1024 ** 2}
        onDrop={onDrop}
        openRef={openRef}
        radius="md"
      >
        <div style={{ pointerEvents: "none" }}>
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload className={classes.icon} size={50} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX className={classes.icon} size={50} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload
                className={classes.icon}
                size={50}
                stroke={1.5}
              />
            </Dropzone.Idle>
          </Group>

          <Text fw={700} fz="lg" mt="xl" ta="center">
            <Dropzone.Accept>Drop files here</Dropzone.Accept>
            <Dropzone.Reject>CSV file less than 30mb</Dropzone.Reject>
            <Dropzone.Idle>Upload users CSV</Dropzone.Idle>
          </Text>

          <Text className={classes.description}>
            Drag&apos;n&apos;drop files here to upload. We can accept only{" "}
            <i>.csv</i> files that are less than 30mb in size.
          </Text>
        </div>
      </Dropzone>

      <Button
        className={classes.control}
        onClick={() => openRef.current?.()}
        radius="xl"
        size="md"
      >
        Select files
      </Button>
    </div>
  );
}
