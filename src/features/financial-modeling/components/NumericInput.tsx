'use client';

import { useState } from 'react';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  value: number;
}

/**
 * Numeric input that displays the value rounded to 2 decimal places when not
 * focused, and shows the full-precision stored value while the user is editing.
 * The onChange handler receives the native event unchanged, so existing
 * `(e) => store.update({ field: Number(e.target.value) })` patterns work as-is.
 */
export function NumericInput({ value, onFocus, onBlur, ...props }: NumericInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      {...props}
      type="number"
      value={focused ? value : +value.toFixed(2)}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
}
