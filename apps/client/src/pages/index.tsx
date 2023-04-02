import { Input } from "@app/components/Input";
import { HeaderSEO } from "@app/components/Layout/HeaderSEO";

export default function Home() {
  return (
    <section className="flex flex-col gap-y-4">
      <HeaderSEO />
      <Input
        label="Label"
        type="text"
      />
    </section>
  );
}
