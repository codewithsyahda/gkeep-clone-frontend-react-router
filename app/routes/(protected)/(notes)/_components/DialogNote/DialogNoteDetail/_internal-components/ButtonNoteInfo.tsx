import { InfoIcon } from 'lucide-react';
import { useEffect, type MouseEventHandler } from 'react';

import ButtonDialogNoteAction from '../../_internal-components/ButtonDialogNoteAction';

export default function ButtonNoteInfo({
  setClose,
  handleToggle,
}: Readonly<{
  setClose: () => void;
  handleToggle: MouseEventHandler<HTMLButtonElement>;
}>) {
  const dataComponent = 'btn-note-info';

  useEffect(() => {
    const hideNoteInfo = (ev: PointerEvent) => {
      const evTarget = ev.target as HTMLElement;

      if (!evTarget.closest(`button[data-component="${dataComponent}"]`))
        setClose();
    };

    document.addEventListener('click', hideNoteInfo);

    return () => {
      document.removeEventListener('click', hideNoteInfo);
    };
  }, [setClose]);

  return (
    <ButtonDialogNoteAction
      data-component={dataComponent}
      tooltipTitle="Info"
      onClick={handleToggle}
    >
      <InfoIcon className="size-4" />
    </ButtonDialogNoteAction>
  );
}
