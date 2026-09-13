"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { ResourceListCard } from "@/components/profile/resource-list-card";
import { familyHistorySchema, type FamilyHistoryFormValues } from "@/lib/validation/profile";
import { familyHistoryHooks } from "@/hooks/use-medical-records";
import { getProfileErrorMessage } from "@/hooks/use-profile";
import type { FamilyHistoryDto } from "@/types/profile";

const RELATION_OPTIONS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "SIBLING", label: "Sibling" },
  { value: "GRANDPARENT", label: "Grandparent" },
  { value: "OTHER", label: "Other" }
];
const RELATION_LABELS: Record<string, string> = Object.fromEntries(
  RELATION_OPTIONS.map((o) => [o.value, o.label])
);

function FamilyHistoryForm({
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting,
  submitError
}: {
  initialValues?: FamilyHistoryDto;
  onCancel: () => void;
  onSubmit: (values: Omit<FamilyHistoryDto, "id">) => void;
  isSubmitting: boolean;
  submitError?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FamilyHistoryFormValues>({
    resolver: zodResolver(familyHistorySchema),
    defaultValues: initialValues
      ? {
          relation: initialValues.relation,
          condition: initialValues.condition,
          notes: initialValues.notes ?? ""
        }
      : { relation: "OTHER" }
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          relation: values.relation,
          condition: values.condition,
          notes: values.notes || null
        })
      )}
      noValidate
    >
      {submitError ? <p className="text-xs text-danger">{submitError}</p> : null}
      <SelectField
        label="Relation"
        options={RELATION_OPTIONS}
        error={errors.relation?.message}
        {...register("relation")}
      />
      <InputField label="Condition" error={errors.condition?.message} {...register("condition")} />
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

export function FamilyHistorySection() {
  const { data, isLoading, isError } = familyHistoryHooks.useList();
  const create = familyHistoryHooks.useCreate();
  const update = familyHistoryHooks.useUpdate();
  const remove = familyHistoryHooks.useRemove();

  return (
    <ResourceListCard<FamilyHistoryDto>
      title="Family history"
      items={data}
      isLoading={isLoading}
      isError={isError}
      emptyLabel="No family history added yet."
      addLabel="Add entry"
      renderRow={(item) => (
        <span>
          <span className="font-medium">{RELATION_LABELS[item.relation]}</span> ·{" "}
          {item.condition}
        </span>
      )}
      renderForm={(props) => <FamilyHistoryForm {...props} />}
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
