"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { ResourceListCard } from "@/components/profile/resource-list-card";
import { medicineSchema, type MedicineFormValues } from "@/lib/validation/profile";
import { medicineHooks } from "@/hooks/use-medical-records";
import { getProfileErrorMessage } from "@/hooks/use-profile";
import type { MedicineDto } from "@/types/profile";

function MedicineForm({
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  submitError
}: {
  initialValues?: MedicineDto;
  onCancel: () => void;
  onSubmit: (values: Omit<MedicineDto, "id">) => void;
  isSubmitting: boolean;
  submitError?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: initialValues ?? { isOngoing: true }
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError ? <p className="text-xs text-danger">{submitError}</p> : null}
      <InputField label="Medicine name" error={errors.name?.message} {...register("name")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Dosage" placeholder="e.g. 500mg" error={errors.dosage?.message} {...register("dosage")} />
        <InputField
          label="Frequency"
          placeholder="e.g. Twice daily"
          error={errors.frequency?.message}
          {...register("frequency")}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("isOngoing")} />
        Currently taking this
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}

export function MedicinesSection() {
  const { data, isLoading, isError } = medicineHooks.useList();
  const create = medicineHooks.useCreate();
  const update = medicineHooks.useUpdate();
  const remove = medicineHooks.useRemove();

  return (
    <ResourceListCard<MedicineDto>
      title="Current medications"
      items={data}
      isLoading={isLoading}
      isError={isError}
      emptyLabel="No medications added yet."
      addLabel="Add medicine"
      renderRow={(item) => (
        <span className="flex items-center gap-2">
          {item.name} · {item.dosage} · {item.frequency}
          {item.isOngoing ? <Badge variant="primary">Ongoing</Badge> : null}
        </span>
      )}
      renderForm={(props) => <MedicineForm {...props} />}
      onCreate={(values) => create.mutate(values)}
      onUpdate={(id, values) => update.mutate({ id, payload: values })}
      onDelete={(id) => remove.mutate(id)}
      isCreating={create.isPending}
      isUpdating={update.isPending}
      isDeleting={remove.isPending}
      createError={create.isError ? getProfileErrorMessage(create.error) : undefined}
      updateError={update.isError ? getProfileErrorMessage(update.error) : undefined}
    />
  );
}
