import { MetricPanel } from "./MetricPanel";
import { formatBytes, formatPercent, getUsagePercent } from "./formatters";

import classes from "../server.module.css";

export function ServerMetrics({ systemInfo }: { systemInfo?: SystemInfo | undefined }) {
  const memUsage = systemInfo ? getUsagePercent(systemInfo.mem.used, systemInfo.mem.total) : 0;
  const fsUsage = systemInfo ? getUsagePercent(systemInfo.fs.used, systemInfo.fs.size) : 0;

  return (
    <div className={classes.metricsGrid}>
      <MetricPanel
        detail={`${systemInfo?.cpu.vendor ?? "--"} - ${systemInfo?.cpu.physicalCores ?? "--"} physical cores`}
        label="CPU"
        value={systemInfo?.cpu.brand ?? "--"}
      />
      <MetricPanel
        detail={`${formatBytes(systemInfo?.mem.used ?? 0)} of ${formatBytes(systemInfo?.mem.total ?? 0)}`}
        label="Memory"
        progress={memUsage}
        value={formatPercent(memUsage)}
      />
      <MetricPanel
        detail={`${formatPercent(systemInfo?.load.average ?? Number.NaN)} average`}
        label="Current Load"
        progress={Math.min(systemInfo?.load.current ?? 0, 100)}
        value={formatPercent(systemInfo?.load.current ?? Number.NaN)}
      />
      <MetricPanel
        detail={`${formatBytes(systemInfo?.fs.available ?? 0)} available`}
        label="Filesystem"
        progress={fsUsage}
        value={formatPercent(fsUsage)}
      />
    </div>
  );
}
