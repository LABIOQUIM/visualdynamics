import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { HeaderSEO } from "@app/components/Layout/HeaderSEO";
import { Select } from "@app/components/Select";
import {
  APOFormSchema,
  APOFormSchemaType
} from "@app/schemas/pages/dynamic/apo.zod";
import { boxTypes } from "@app/utils/box-types";
import { forceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export default function APODynamic() {
  const { register, watch, setValue } = useForm<APOFormSchemaType>({
    resolver: zodResolver(APOFormSchema)
  });

  return (
    <section className="flex flex-col gap-y-4">
      <HeaderSEO />
      <form className="flex flex-col gap-y-3">
        <Input
          label="Proteína (.pdb)"
          type="file"
          accept=".pdb"
          {...register("protein")}
        />

        <Select<keyof typeof forceFields>
          label="Campo de Força"
          values={forceFields}
          onChange={(newForceField) => setValue("forceField", newForceField)}
          selectedValue={watch("forceField")}
          placeholder="Selecione um Campo de Força"
        />

        <Select<keyof typeof waterModels>
          label="Modelo de Água"
          values={waterModels}
          onChange={(newWaterModel) => setValue("waterModel", newWaterModel)}
          selectedValue={watch("waterModel")}
          placeholder="Selecione um Modelo de Água"
        />

        <Select<keyof typeof boxTypes>
          label="Tipo de Caixa"
          values={boxTypes}
          onChange={(newBoxType) => setValue("boxType", newBoxType)}
          selectedValue={watch("boxType")}
          placeholder="Selecione um Tipo de Caixa"
        />

        <Button type="submit">Enviar</Button>
      </form>
    </section>
  );
}
