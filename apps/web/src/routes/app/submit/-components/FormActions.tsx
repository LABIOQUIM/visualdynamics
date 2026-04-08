import { Button } from "@mantine/core";
import { IconDownload, IconPlayerPlay } from "@tabler/icons-react";

import { downloadMdpFiles } from "@/mutations/downloadMdpFiles";

interface Props {
  onDownloadCommands: () => void;
  submissionEnabled: boolean;
  submitClassName: string;
  containerClassName: string;
}

export function FormActions({
  onDownloadCommands,
  submissionEnabled,
  submitClassName,
  containerClassName,
}: Props) {
  return (
    <div className={containerClassName}>
      <Button
        leftSection={<IconDownload size={16} />}
        onClick={onDownloadCommands}
        type="button"
        variant="light"
      >
        Commands
      </Button>
      <Button
        leftSection={<IconDownload size={16} />}
        onClick={downloadMdpFiles}
        type="button"
        variant="light"
      >
        MDP Files
      </Button>
      <Button
        className={submitClassName}
        disabled={!submissionEnabled}
        leftSection={<IconPlayerPlay size={16} />}
        type="submit"
      >
        Run Simulation
      </Button>
    </div>
  );
}
