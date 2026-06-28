import { useState } from 'react';

export default function useBoolean(initialValue: boolean | (() => boolean)) {
  const [value, setValue] = useState(initialValue);

  const toggleValue = () => setValue((prevValue) => !prevValue);
  const setFalse = () => setValue(() => false);
  const setTrue = () => setValue(() => true);

  return { value, toggleValue, setFalse, setTrue };
}
