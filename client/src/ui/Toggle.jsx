import { Field, Label, Switch } from "@headlessui/react";

function Toggle({ label, enabled, onChange }) {
  return (
    <Field>
      <div className="flex items-center gap-x-2">
        <Label>{label}</Label>
        <Switch
          checked={enabled}
          onChange={onChange}
          className={`${
            enabled ? "bg-primary-900" : "bg-secondary-300"
          } group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition `}
        >
          <span className="size-4 -translate-x-1 rounded-full bg-secondary-0 transition group-data-[checked]:-translate-x-6" />
        </Switch>
      </div>
    </Field>
  );
}
export default Toggle;
