import { useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Field, { type FieldProps } from "./Field";

type InputProps = ComponentProps<"input"> & FieldProps;

function Input({ id, label, error, required, ...props }: InputProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) =>
        props.type === "password" ? (
          <PasswordControl {...props} {...control} />
        ) : (
          <ShadcnInput {...props} {...control} />
        )
      }
    </Field>
  );
}

// Every password field gets a show/hide toggle.
function PasswordControl({ className, ...props }: ComponentProps<"input">) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <ShadcnInput {...props} type={visible ? "text" : "password"} className={cn("pe-10", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={t(visible ? "auth.hidePassword" : "auth.showPassword")}
        title={t(visible ? "auth.hidePassword" : "auth.showPassword")}
        aria-controls={props.id}
        className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
export default Input;
