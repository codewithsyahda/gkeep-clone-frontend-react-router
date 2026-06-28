import { Editor } from '@tiptap/react';
import {
  useEffect,
  useRef,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from 'react';

import DialogNoteContainer from './DialogNoteContainer';
import NoteEditor from './NoteEditor';
import NoteFormattingTools from './NoteFormattingTools';

const useResizeDialogNote = ({
  dialogPaperRef,
  dialogInputsGroupRef,
  dialogActionsRef,
}: Readonly<{
  dialogPaperRef: RefObject<HTMLDivElement | null>;
  dialogInputsGroupRef: RefObject<HTMLDivElement | null>;
  dialogActionsRef: RefObject<HTMLDivElement | null>;
}>) => {
  useEffect(() => {
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    const resizeDialogCreateNote = () => {
      const dialogPaper = dialogPaperRef.current;
      const dialogInputsGroup = dialogInputsGroupRef.current;
      const dialogActions = dialogActionsRef.current;

      if (!dialogPaper || !dialogActions || !dialogInputsGroup) return;

      if (document.documentElement.clientWidth > 600) {
        dialogPaper.style.maxHeight = '';
        return;
      }

      dialogPaper.style.maxHeight = `${visualViewport.height + visualViewport.offsetTop + dialogActions.offsetHeight}px`;
    };

    visualViewport.addEventListener('resize', resizeDialogCreateNote);
    visualViewport.addEventListener('scroll', resizeDialogCreateNote);

    return () => {
      visualViewport.removeEventListener('resize', resizeDialogCreateNote);
      visualViewport.removeEventListener('scroll', resizeDialogCreateNote);
    };
  }, [dialogActionsRef, dialogInputsGroupRef, dialogPaperRef]);
};

const useScrollIntoHiddenSelection = (
  dialogInputsGroupRef: RefObject<HTMLDivElement | null>,
  noteEditor: Editor,
) => {
  useEffect(() => {
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    let pointerPosY = 0;
    let shouldScroll = false;

    const scrollIntoHiddenSelection = () => {
      const dialogInputsGroup = dialogInputsGroupRef.current;

      if (!dialogInputsGroup) return;

      const htmlHeight = document.documentElement.clientHeight;
      const visualMobKbdOn = htmlHeight - visualViewport.height;

      const isMobKbdOn = visualMobKbdOn > 300;

      if (!isMobKbdOn || !shouldScroll) return;

      if (pointerPosY > visualMobKbdOn) {
        dialogInputsGroup.scrollBy(
          0,
          pointerPosY - visualMobKbdOn + visualMobKbdOn / 2,
        );
      }

      shouldScroll = false;
    };

    visualViewport.addEventListener('resize', scrollIntoHiddenSelection);

    const trackPointerPosY = ({
      editor,
    }: Readonly<{
      editor: Editor;
    }>) => {
      const { to } = editor.state.selection;
      const { bottom } = editor.view.coordsAtPos(to);

      pointerPosY = bottom;
      shouldScroll = true;
    };

    noteEditor.on('selectionUpdate', trackPointerPosY);

    return () => {
      visualViewport.removeEventListener('resize', scrollIntoHiddenSelection);
      noteEditor.off('selectionUpdate', trackPointerPosY);
    };
  }, [dialogInputsGroupRef, noteEditor]);
};

export default function DialogNoteEditor({
  type,
  noteEditor,
  fullScreen,
  titleValue,
  actionSection,
  onInputTitle,
  onClose,
}: Readonly<{
  type: 'create-note' | 'detail-note';
  noteEditor: Editor;
  fullScreen: boolean;
  titleValue: string;
  actionSection: ReactNode;
  onInputTitle: (value: string) => void;
  onClose: MouseEventHandler<HTMLButtonElement>;
}>) {
  const dialogContainerRef = useRef<HTMLDivElement>(null);
  const dialogPaperRef = useRef<HTMLDivElement>(null);
  const dialogInputsGroupRef = useRef<HTMLDivElement>(null);
  const dialogFmtMenuRef = useRef<HTMLDivElement>(null);
  const dialogActionsRef = useRef<HTMLDivElement>(null);

  useResizeDialogNote({
    dialogPaperRef,
    dialogInputsGroupRef,
    dialogActionsRef,
  });

  useScrollIntoHiddenSelection(dialogInputsGroupRef, noteEditor);

  return (
    <DialogNoteContainer
      type={type}
      fullScreen={fullScreen}
      onClose={onClose}
      bodySection={
        <>
          <NoteEditor
            noteEditor={noteEditor}
            titleValue={titleValue}
            onInputTitle={onInputTitle}
            rootRef={dialogInputsGroupRef}
          />
          <NoteFormattingTools
            dialogFmtMenuRef={dialogFmtMenuRef}
            noteEditor={noteEditor}
          />
        </>
      }
      actionSection={actionSection}
      dialogContainerRef={dialogContainerRef}
      dialogPaperRef={dialogPaperRef}
      dialogActionsRef={dialogActionsRef}
    />
  );
}
