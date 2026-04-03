import classes from "./TypeBadge.module.css";

const labels: Record<SIMULATION_TYPE, string> = {
  apo: "Free Protein",
  acpype: "With Ligand (ACPYPE)",
};

type TypeBadgeProps = {
  type: SIMULATION_TYPE;
};

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className={`${classes.badge} ${classes[type]}`}>{labels[type]}</span>
  );
}
