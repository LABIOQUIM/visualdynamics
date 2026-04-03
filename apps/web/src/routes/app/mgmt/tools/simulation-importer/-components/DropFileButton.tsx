import classes from "./DropFileButton.module.css";

import { useCallback, useRef } from "react";
import { usePapaParse } from "react-papaparse";
import { Badge, Button, Group, SimpleGrid, Text } from "@mantine/core";
import { Dropzone, type FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { IconCloudUpload, IconDownload, IconX } from "@tabler/icons-react";

import {
  type ImporterSimulation,
  type ImporterUserRow,
  useSimulationImporter,
} from "./Provider";

export function DropFileButton() {
  const { readString } = usePapaParse();
  const { simulations, setSimulations, users, setUsers } =
    useSimulationImporter();
  const simOpenRef = useRef<() => void>(null);
  const usersOpenRef = useRef<() => void>(null);

  const onDropSimulations = useCallback(async (files: FileWithPath[]) => {
    if (!files.length) return;
    const csvText = await files[0].text();
    readString(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setSimulations(results.data as ImporterSimulation[]);
      },
    });
  }, []);

  const onDropUsers = useCallback(async (files: FileWithPath[]) => {
    if (!files.length) return;
    const csvText = await files[0].text();
    readString(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setUsers(results.data as ImporterUserRow[]);
      },
    });
  }, []);

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ flex: 1 }}>
      <div className={classes.wrapper}>
        <Dropzone
          accept={[MIME_TYPES.csv]}
          aria-label="Drop simulations CSV"
          className={classes.dropzone}
          maxSize={30 * 1024 ** 2}
          onDrop={onDropSimulations}
          openRef={simOpenRef}
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
              <Dropzone.Idle>
                {simulations.length > 0 ? (
                  <Badge color="green" size="lg">
                    {simulations.length} simulations loaded
                  </Badge>
                ) : (
                  "Upload simulations CSV"
                )}
              </Dropzone.Idle>
            </Text>
            {simulations.length === 0 && (
              <Text className={classes.description}>
                Drag&apos;n&apos;drop a <i>.csv</i> file exported from the old
                format.
                <br /> Columns: <code>id</code>, <code>user_id</code>,{" "}
                <code>molecule_name</code>, <code>type</code>,{" "}
                <code>status</code>, <code>started_at</code>,{" "}
                <code>ended_at</code>, <code>error_cause</code>,{" "}
                <code>created_at</code>, <code>updated_at</code>,{" "}
                <code>ligand_itp_name</code>, <code>ligand_pdb_name</code>.
              </Text>
            )}
          </div>
        </Dropzone>
        <Button
          className={classes.control}
          onClick={() => simOpenRef.current?.()}
          radius="xl"
          size="md"
        >
          Select simulations file
        </Button>
      </div>

      <div className={classes.wrapper}>
        <Dropzone
          accept={[MIME_TYPES.csv]}
          aria-label="Drop users CSV"
          className={classes.dropzone}
          maxSize={10 * 1024 ** 2}
          onDrop={onDropUsers}
          openRef={usersOpenRef}
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
              <Dropzone.Reject>CSV file less than 10mb</Dropzone.Reject>
              <Dropzone.Idle>
                {users.length > 0 ? (
                  <Badge color="green" size="lg">
                    {users.length} users loaded
                  </Badge>
                ) : (
                  "Upload users CSV"
                )}
              </Dropzone.Idle>
            </Text>
            {users.length === 0 && (
              <Text className={classes.description}>
                Required — links simulations to their owners.
                <br /> Columns: <code>id</code>, <code>user_name</code>,{" "}
                <code>email</code>, <code>first_name</code>,{" "}
                <code>last_name</code>.
              </Text>
            )}
          </div>
        </Dropzone>
        <Button
          className={classes.control}
          color={users.length > 0 ? "green" : undefined}
          onClick={() => usersOpenRef.current?.()}
          radius="xl"
          size="md"
          variant={users.length > 0 ? "light" : "default"}
        >
          {users.length > 0
            ? `${users.length} users — reload`
            : "Select users file"}
        </Button>
      </div>
    </SimpleGrid>
  );
}
