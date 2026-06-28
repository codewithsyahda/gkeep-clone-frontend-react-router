import { useState } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

export default function InputPassword(
  props: Readonly<Omit<TextFieldProps, 'type' | 'slotProps'>>,
) {
  const [show, setShow] = useState(false);

  const { disabled } = props;

  const handlePasswordDisplay = () => setShow((prevValue) => !prevValue);

  return (
    <TextField
      {...props}
      type={!disabled && show ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled={disabled}
                onClick={handlePasswordDisplay}
                aria-label={show ? 'hide the password' : 'display the password'}
              >
                {!disabled && show ? <EyeIcon /> : <EyeOffIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
