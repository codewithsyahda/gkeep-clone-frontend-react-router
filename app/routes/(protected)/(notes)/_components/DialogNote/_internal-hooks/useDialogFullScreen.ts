import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

const useDialogFullScreen = () => {
  const [fullScreen, setFullScreen] = useState(false);

  const muiTheme = useTheme();

  const handleToggleFullScreen = () => {
    if (document.documentElement.clientWidth > muiTheme.breakpoints.values.sm)
      setFullScreen((prevValue) => !prevValue);
  };

  return { fullScreen, handleToggleFullScreen };
};

export default useDialogFullScreen;
