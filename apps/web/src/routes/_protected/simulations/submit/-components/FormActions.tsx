import { Button } from "@mantine/core";
import { useFlag } from "@openfeature/react-sdk";
import { IconDownload, IconPlayerPlay } from "@tabler/icons-react";

import { downloadMdpFiles } from "@/mutations/downloadMdpFiles";

interface Props {
  onDownloadCommands: () => void;
  submitClassName: string;
  containerClassName: string;
}

export function FormActions({
  onDownloadCommands,
  submitClassName,
  containerClassName,
}: Props) {
  const { value: submissionEnabled } = useFlag("simulation-submission", false);

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
