import dynamic from "next/dynamic";

const Card = dynamic(
  () =>
    import("@app/components/dynamics/my-dynamics/card").then(
      (m) => m.DynamicCard
    ),
  {
    ssr: false
  }
);

interface MyDynamicsListProps {
  dynamics: Dynamic[];
}

export function MyDynamicsList({ dynamics }: MyDynamicsListProps) {
  return (
    <div className="flex flex-col gap-y-1">
      {dynamics.map((dynamic) => (
        <Card
          dynamic={dynamic}
          key={dynamic.celeryId}
        />
      ))}
    </div>
  );
}
