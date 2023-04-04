import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@app/components/Button";
import { Input } from "@app/components/Input";
import { PageLayout } from "@app/components/Layout/Page";
import { Select } from "@app/components/Select";
import { Switch } from "@app/components/Switch";
import { api } from "@app/lib/api";
import {
  APOFormSchema,
  APOFormSchemaType
} from "@app/schemas/pages/dynamic/apo.zod";
import { boxTypes } from "@app/utils/box-types";
import { forceFields } from "@app/utils/force-fields";
import { waterModels } from "@app/utils/water-models";

export default function APODynamic() {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<APOFormSchemaType>({
    resolver: zodResolver(APOFormSchema),
    defaultValues: {
      neutralize: true,
      ignore: true,
      double: false
    }
  });

  const handleSubmitDynamic: SubmitHandler<APOFormSchemaType> = async (
    data
  ) => {
    const formData = new FormData();

    formData.append("file_pdb", data.protein[0]);
    formData.append("force_field", data.forceField);
    formData.append("water_model", data.waterModel);
    formData.append("box_type", data.boxType);
    formData.append("box_distance", data.boxDistance);
    formData.append("bootstrap", data.bootstrap ? "True" : "False");
    formData.append("neutralize", data.neutralize ? "True" : "False");
    formData.append("double", data.double ? "True" : "False");
    formData.append("ignore", data.ignore ? "True" : "False");
    formData.append("user_id", "IvoVieira");
    formData.append("dynamic_id", "PrimeiraAPO");

    await api
      .post("/apo", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(() => alert("Foi"))
      .catch(() => alert("Não foi"));
  };

  return (
    <PageLayout title="Dinâmica APO">
      <form
        className="flex flex-col gap-y-2"
        onSubmit={handleSubmit(handleSubmitDynamic)}
      >
        <Input
          label="Proteína (.pdb)"
          type="file"
          accept=".pdb"
          error={errors.protein}
          {...register("protein")}
        />

        <Select<keyof typeof forceFields>
          error={errors.forceField}
          label="Campo de Força"
          name="forceField"
          onChange={(newForceField) => setValue("forceField", newForceField)}
          placeholder="Selecione um Campo de Força"
          selectedValue={watch("forceField")}
          values={forceFields}
        />

        <Select<keyof typeof waterModels>
          error={errors.waterModel}
          label="Modelo de Água"
          name="waterModel"
          onChange={(newWaterModel) => setValue("waterModel", newWaterModel)}
          placeholder="Selecione um Modelo de Água"
          selectedValue={watch("waterModel")}
          values={waterModels}
        />

        <Select<keyof typeof boxTypes>
          error={errors.boxType}
          label="Tipo de Caixa"
          name="boxType"
          onChange={(newBoxType) => setValue("boxType", newBoxType)}
          placeholder="Selecione um Tipo de Caixa"
          selectedValue={watch("boxType")}
          values={boxTypes}
        />

        <Input
          label="Distância da Caixa (nm)"
          error={errors.boxDistance}
          type="number"
          {...register("boxDistance")}
        />

        <label>Opções</label>
        <div className="flex flex-col gap-y-2">
          <Switch
            label="Neutralizar sistema"
            checked={watch("neutralize")}
            onCheckedChange={(bool) => setValue("neutralize", bool)}
            name="neutralize"
            disabled
          />
          <Switch
            label="Ignorar hidrogênios"
            checked={watch("ignore")}
            onCheckedChange={(bool) => setValue("ignore", bool)}
            name="ignore"
            disabled
          />
          <Switch
            label="Calcular com precisão dupla"
            checked={watch("double")}
            onCheckedChange={(bool) => setValue("double", bool)}
            name="double"
            disabled
          />
          <Switch
            label="Executar dinâmica na nuvem"
            checked={watch("bootstrap")}
            onCheckedChange={(bool) => setValue("bootstrap", bool)}
            name="bootstrap"
          />
        </div>

        <Button type="submit">Enviar</Button>
      </form>
    </PageLayout>
  );
}
