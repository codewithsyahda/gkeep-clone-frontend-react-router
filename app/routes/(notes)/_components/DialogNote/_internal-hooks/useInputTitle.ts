import { useState } from 'react';

export default function useInputTitle(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const handleInputTitle = (value: string) => setValue(() => value);
  return { titleValue: value, handleInputTitle };
}
