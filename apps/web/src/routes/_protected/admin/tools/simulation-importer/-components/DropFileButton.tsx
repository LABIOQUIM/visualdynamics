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

interface CsvDropzoneProps {
  ariaLabel: string;
  maxSize: number;
  onDrop: (files: FileWithPath[]) => void;
  openRef: React.RefObject<() => void>;
  loadedCount: number;
  idleLabel: string;
  rejectLabel: string;
  description: React.ReactNode;
  buttonLabel: string;
  buttonColor?: string;
  buttonVariant?: string;
}

function CsvDropzone({
  ariaLabel,
  maxSize,
  onDrop,
  openRef,
  loadedCount,
  idleLabel,
  rejectLabel,
  description,
  buttonLabel,
  buttonColor,
  buttonVariant,
}: CsvDropzoneProps) {
  return (
    <div className={classes.wrapper}>
      <Dropzone
        accept={[MIME_TYPES.csv]}
        aria-label={ariaLabel}
        className={classes.dropzone}
        maxSize={maxSize}
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
            <Dropzone.Reject>{rejectLabel}</Dropzone.Reject>
            <Dropzone.Idle>
              {loadedCount > 0 ? (
                <Badge color="green" size="lg">
                  {loadedCount} {idleLabel}
                </Badge>
              ) : (
                idleLabel
              )}
            </Dropzone.Idle>
          </Text>
          {loadedCount === 0 && (
            <Text className={classes.description}>{description}</Text>
          )}
        </div>
      </Dropzone>
      <Button
        className={classes.control}
        {...(buttonColor !== undefined ? { color: buttonColor } : {})}
        onClick={() => openRef.current?.()}
        radius="xl"
        size="md"
        {...(buttonVariant !== undefined ? { variant: buttonVariant } : {})}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export function DropFileButton() {
  const { readString } = usePapaParse();
  const { simulations, setSimulations, users, setUsers } =
    useSimulationImporter();
  const simOpenRef = useRef<() => void>(null!);
  const usersOpenRef = useRef<() => void>(null!);

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
      <CsvDropzone
        ariaLabel="Drop simulations CSV"
        buttonLabel="Select simulations file"
        description={
          <>
            Drag&apos;n&apos;drop a <i>.csv</i> file exported from the old
            format.
            <br /> Columns: <code>id</code>, <code>user_id</code>,{" "}
            <code>molecule_name</code>, <code>type</code>, <code>status</code>,{" "}
            <code>started_at</code>, <code>ended_at</code>,{" "}
            <code>error_cause</code>, <code>created_at</code>,{" "}
            <code>updated_at</code>, <code>ligand_itp_name</code>,{" "}
            <code>ligand_pdb_name</code>.
          </>
        }
        idleLabel={
          simulations.length > 0
            ? `${simulations.length} simulations loaded`
            : "Upload simulations CSV"
        }
        loadedCount={simulations.length}
        maxSize={30 * 1024 ** 2}
        onDrop={onDropSimulations}
        openRef={simOpenRef}
        rejectLabel="CSV file less than 30mb"
      />
      <CsvDropzone
        ariaLabel="Drop users CSV"
        {...(users.length > 0 ? { buttonColor: "green" } : {})}
        buttonLabel={
          users.length > 0 ? `${users.length} users — reload` : "Select users file"
        }
        buttonVariant={users.length > 0 ? "light" : "default"}
        description={
          <>
            Required — links simulations to their owners.
            <br /> Columns: <code>id</code>, <code>user_name</code>,{" "}
            <code>email</code>, <code>first_name</code>,{" "}
            <code>last_name</code>.
          </>
        }
        idleLabel={
          users.length > 0 ? `${users.length} users loaded` : "Upload users CSV"
        }
        loadedCount={users.length}
        maxSize={10 * 1024 ** 2}
        onDrop={onDropUsers}
        openRef={usersOpenRef}
        rejectLabel="CSV file less than 10mb"
      />
    </SimpleGrid>
  );
}
