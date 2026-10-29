import { useId } from "react";
import { Switch } from "@/components/ui/switch";

type ToggleProps = {
  label: string;
  enabled: boolean;
  onChange: (checked: boolean) => void;
};

function Toggle({ label, enabled, onChange }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-x-2">
      <label htmlFor={id}>{label}</label>
      <Switch id={id} checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}
export default Toggle;
