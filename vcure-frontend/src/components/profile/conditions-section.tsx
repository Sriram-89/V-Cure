"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { ResourceListCard } from "@/components/profile/resource-list-card";
import { conditionSchema, type ConditionFormValues } from "@/lib/validation/profile";
import { conditionHooks } from "@/hooks/use-medical-records";
import { getProfileErrorMessage } from "@/hooks/use-profile";
import type { MedicalConditionDto } from "@/types/profile";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "MANAGED", label: "Managed" },
  { value: "RESOLVED", label: "Resolved" }
];

function statusBadgeVariant(status: MedicalConditionDto["status"]) {
  if (status === "ACTIVE") return "secondary" as const;
  if (status === "MANAGED") return "primary" as const;
  return "neutral" as const;
}

function ConditionForm({
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  submitError
}: {
  initialValues?: MedicalConditionDto;
  onCancel: () => void;
  onSubmit: (values: Omit<MedicalConditionDto, "id">) => void;
  isSubmitting: boolean;
  submitError?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionSchema),
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          status: initialValues.status,
          diagnosedDate: initialValues.diagnosedDate ?? "",
          notes: initialValues.notes ?? ""
        }
      : { status: "ACTIVE" }
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: values.name,
          status: values.status,
          diagnosedDate: values.diagnosedDate || null,
          notes: values.notes || null
        })
      )}
      noValidate
    >
      {submitError ? <p className="text-xs text-danger">{submitError}</p> : null}
      <InputField label="Condition" error={errors.name?.message} {...register("name")} />
      <SelectField
        label="Status"
        options={STATUS_OPTIONS}
        error={errors.status?.message}
        {...register("status")}
      />
      <InputField
        label="Diagnosed date (optional)"
        type="date"
        error={errors.diagnosedDate?.message}
        {...register("diagnosedDate")}
      />
      <InputField label="Notes (optional)" error={errors.notes?.message} {...register("notes")} />
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

export function ConditionsSection() {
  const { data, isLoading, isError } = conditionHooks.useList();
  const create = conditionHooks.useCreate();
  const update = conditionHooks.useUpdate();
  const remove = conditionHooks.useRemove();

  return (
    <ResourceListCard<MedicalConditionDto>
      title="Existing conditions"
      items={data}
      isLoading={isLoading}
      isError={isError}
      emptyLabel="No conditions added yet."
      addLabel="Add condition"
      renderRow={(item) => (
        <span className="flex items-center gap-2">
          {item.name}
          <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
        </span>
      )}
      renderForm={(props) => <ConditionForm {...props} />}
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
