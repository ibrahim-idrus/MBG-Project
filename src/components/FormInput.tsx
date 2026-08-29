import type { FC, Child } from 'hono/jsx';

interface FormInputProps {
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  name?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  class?: string;
}

export const FormInput: FC<FormInputProps> = ({
  label,
  type = 'text',
  placeholder = '',
  name,
  options,
  rows = 3,
  class: extraClass = '',
}) => {
  const baseClass = 'w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <div class="relative">
            <select name={name} class={`${baseClass} appearance-none cursor-pointer`}>
              <option disabled selected value="">{placeholder}</option>
              {options?.map((opt) => (
                <option value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
              <span class="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            name={name}
            class={`${baseClass} resize-none`}
            placeholder={placeholder}
            rows={rows}
          ></textarea>
        );
      case 'date':
        return (
          <input type="date" name={name} class={`${baseClass} appearance-none`} />
        );
      case 'number':
        return (
          <input type="number" name={name} class={baseClass} placeholder={placeholder} />
        );
      default:
        return (
          <input type="text" name={name} class={baseClass} placeholder={placeholder} />
        );
    }
  };

  return (
    <div class={extraClass}>
      <label class="block font-label-md text-label-md text-on-surface mb-1">{label}</label>
      {renderInput()}
    </div>
  );
};
