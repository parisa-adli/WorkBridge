import { useId } from "react";
import { Label } from "@/components/ui/label";
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
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}
export default Toggle;
