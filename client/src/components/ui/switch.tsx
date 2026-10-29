import type { ComponentProps } from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// shortcut: old-scale colors kept from the headless Toggle so screenshots match, replace with stock shadcn classes in Phase 39c.
function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group inline-flex h-6 w-11 items-center rounded-full bg-secondary-300 transition data-[state=checked]:bg-primary-900",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="size-4 translate-x-1 rtl:-translate-x-1 rounded-full bg-secondary-0 transition data-[state=checked]:translate-x-6 rtl:data-[state=checked]:-translate-x-6"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
