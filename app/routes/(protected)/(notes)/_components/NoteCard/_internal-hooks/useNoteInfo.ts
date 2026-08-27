import { useEffect, useState } from 'react';

const useNoteInfo = (noteId: string) => {
  const [openInfo, setOpenInfo] = useState(false);

  const handleToggleOpenInfo = () => setOpenInfo((prevValue) => !prevValue);

  useEffect(() => {
    const hideNoteInfo = (ev: PointerEvent) => {
      const evTarget = ev.target as HTMLElement;

      if (!evTarget.closest(`[data-component="note-${noteId}-info-btn"]`)) {
        setOpenInfo(() => false);
      }
    };

    document.addEventListener('click', hideNoteInfo);

    return () => {
      document.removeEventListener('click', hideNoteInfo);
    };
  }, [noteId]);

  return { openInfo, handleToggleOpenInfo };
};

export default useNoteInfo;
