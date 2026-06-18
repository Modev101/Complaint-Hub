import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  className?: string;
}

export const SelectForm = ({
  label,
  error,
  id,
  options,
  className = "",
  value,
  onValueChange,
}: SelectProps) => {
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={`w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:border-accent transition-colors ${className}`}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

SelectForm.displayName = "SelectForm";
