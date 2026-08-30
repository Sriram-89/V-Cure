"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { ResourceListCard } from "@/components/profile/resource-list-card";
import { allergySchema, type AllergyFormValues } from "@/lib/validation/profile";
import { allergyHooks } from "@/hooks/use-medical-records";
import { getProfileErrorMessage } from "@/hooks/use-profile";
import type { AllergyDto } from "@/types/profile";

const SEVERITY_OPTIONS = [
  { value: "MILD", label: "Mild" },
  { value: "MODERATE", label: "Moderate" },
  { value: "SEVERE", label: "Severe" }
];

function severityBadgeVariant(severity: AllergyDto["severity"]) {
  if (severity === "SEVERE") return "secondary" as const;
  return "neutral" as const;
}

function AllergyForm({
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  submitError
}: {
  initialValues?: AllergyDto;
  onCancel: () => void;
  onSubmit: (values: Omit<AllergyDto, "id">) => void;
  isSubmitting: boolean;
  submitError?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AllergyFormValues>({
    resolver: zodResolver(allergySchema),
    defaultValues: initialValues
      ? {
          allergen: initialValues.allergen,
          severity: initialValues.severity,
          reaction: initialValues.reaction ?? ""
        }
      : { severity: "MILD" }
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          allergen: values.allergen,
          severity: values.severity,
          reaction: values.reaction || null
        })
      )}
      noValidate
    >
      {submitError ? <p className="text-xs text-danger">{submitError}</p> : null}
      <InputField label="Allergen" error={errors.allergen?.message} {...register("allergen")} />
      <SelectField
        label="Severity"
        options={SEVERITY_OPTIONS}
        error={errors.severity?.message}
        {...register("severity")}
      />
      <InputField
        label="Reaction (optional)"
        error={errors.reaction?.message}
        {...register("reaction")}
      />
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

export function AllergiesSection() {
  const { data, isLoading, isError } = allergyHooks.useList();
  const create = allergyHooks.useCreate();
  const update = allergyHooks.useUpdate();
  const remove = allergyHooks.useRemove();

  return (
    <ResourceListCard<AllergyDto>
      title="Allergies"
      items={data}
      isLoading={isLoading}
      isError={isError}
      emptyLabel="No allergies added yet."
      addLabel="Add allergy"
      renderRow={(item) => (
        <span className="flex items-center gap-2">
          {item.allergen}
          <Badge variant={severityBadgeVariant(item.severity)}>{item.severity}</Badge>
        </span>
      )}
      renderForm={(props) => <AllergyForm {...props} />}
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
