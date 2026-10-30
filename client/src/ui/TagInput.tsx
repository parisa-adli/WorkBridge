import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Field from "./Field";

type TagInputProps = { label: string; value: string[]; onChange: (tags: string[]) => void };

// No shadcn tag input exists: an Input that turns Enter into a Badge, as react-tag-input-component did.
function TagInput({ label, value, onChange }: TagInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // Enter adds a tag, it does not submit the form
      const tag = text.trim();
      if (tag && !value.includes(tag)) onChange([...value, tag]);
      setText("");
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <Field label={label}>
      {(control) => (
        <div className="flex flex-col gap-2">
          {value.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {value.map((tag) => (
                <li key={tag}>
                  <Badge variant="secondary" dir="auto">
                    {tag}
                    <button
                      type="button"
                      onClick={() => onChange(value.filter((item) => item !== tag))}
                      aria-label={t("common.removeTag", { tag })}
                      className="rounded-full hover:text-destructive"
                    >
                      <X aria-hidden="true" />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Input {...control} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
      )}
    </Field>
  );
}
export default TagInput;
