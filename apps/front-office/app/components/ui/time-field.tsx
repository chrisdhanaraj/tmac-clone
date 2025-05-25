import {
  TimeField as ReactAriaTimeField,
  Label,
  DateInput,
  DateSegment,
} from "react-aria-components";
import { cn } from "~/utils/utils";
import type { Time } from "@internationalized/date";

interface TimeFieldProps {
  label?: string;
  value?: Time | null;
  onChange?: (val: Time | null) => void;
  isInvalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function TimeField({
  label = "Event time",
  value,
  onChange,
  isInvalid = false,
  disabled = false,
  required = false,
}: TimeFieldProps) {
  return (
    <ReactAriaTimeField
      className="flex flex-col gap-2"
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
      isDisabled={disabled}
      isRequired={required}
    >
      <Label className="text-sm font-medium leading-none">{label}</Label>
      <DateInput
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 items-center text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        )}
      >
        {(segment) => (
          <DateSegment
            segment={segment}
            className={({ isPlaceholder, isFocused, isDisabled, isInvalid }) =>
              cn(
                "text-end outline-none rounded-md transition-colors",
                "data-[placeholder]:text-muted-foreground data-[placeholder]:italic",
                "data-[type=literal]:px-0",
                isPlaceholder && "text-muted-foreground italic",
                isFocused && "underline",
                isDisabled && "opacity-50 cursor-not-allowed",
                isInvalid && "text-destructive",
                "text-base md:text-sm"
              )
            }
          />
        )}
      </DateInput>
    </ReactAriaTimeField>
  );
}
