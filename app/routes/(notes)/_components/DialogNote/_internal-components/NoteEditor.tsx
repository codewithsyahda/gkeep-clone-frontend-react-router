import { Editor, EditorContent } from '@tiptap/react';
import {
  useEffect,
  useRef,
  type ClipboardEventHandler,
  type FocusEventHandler,
  type FormEventHandler,
  type PointerEventHandler,
  type RefObject,
} from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function NoteEditor({
  noteEditor,
  titleValue,
  disabledInputTitle,
  rootRef,
  onInputTitle,
}: Readonly<{
  noteEditor: Editor;
  titleValue: string;
  disabledInputTitle?: boolean;
  rootRef?: RefObject<HTMLDivElement | null>;
  onInputTitle: (value: string) => void;
}>) {
  const handleInputTitle: FormEventHandler<HTMLDivElement> = (ev) => {
    const evTarget = ev.currentTarget as HTMLDivElement;

    if (evTarget.innerHTML === '<br>') {
      evTarget.innerHTML = '';
    }
  };

  const handleUpdateInputTitle: FocusEventHandler<HTMLDivElement> = (ev) => {
    const evTarget = ev.currentTarget as HTMLDivElement;
    onInputTitle(evTarget.textContent);
  };

  const handlePasteInputTitle: ClipboardEventHandler<HTMLDivElement> = (ev) => {
    /**
     * Copies rich-text value into the note editor title
     * input as plain text.
     */
    const selection = globalThis.getSelection();

    if (!selection) return;

    ev.preventDefault();

    const text = ev.clipboardData.getData('text/plain');

    if (!selection.rangeCount) return;

    selection.deleteFromDocument();

    const textNode = document.createTextNode(text);

    selection.getRangeAt(0).insertNode(textNode);
    selection.collapseToEnd();
  };

  const inputTitleElemRef = useRef<HTMLDivElement>(null);
  const focusedByPointerRef = useRef(false);

  const handlePointerDownTitle: PointerEventHandler<HTMLDivElement> = (ev) => {
    if (ev.currentTarget !== document.activeElement) {
      focusedByPointerRef.current = true;
    }
  };

  const handleFocusInputTitle: FocusEventHandler<HTMLDivElement> = () => {
    if (focusedByPointerRef.current) {
      focusedByPointerRef.current = false;
      return;
    }

    // Places the text caret to the last textContent value
    const inputTitleElem = inputTitleElemRef.current;

    if (!inputTitleElem) return;

    const range = document.createRange();

    range.selectNodeContents(inputTitleElem);
    range.collapse(false);

    const selection = window.getSelection();

    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  /**
   * The useEffect code below synchronizes the note
   * editor title input value to the titleValue prop.
   */
  useEffect(() => {
    const inputTitleElem = inputTitleElemRef.current;

    if (!inputTitleElem) return;

    if (inputTitleElem.textContent !== titleValue) {
      inputTitleElem.textContent = titleValue;
    }
  }, [titleValue]);

  /**
   * The useEffect code below focuses the note editor
   * body input after the user presses the Enter key
   * from the note editor title input.
   */
  useEffect(() => {
    const inputTitleElem = inputTitleElemRef.current;

    if (!inputTitleElem) return;

    const focusToNoteEditor = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        noteEditor.commands.focus('start');
      }
    };

    inputTitleElem.addEventListener('keydown', focusToNoteEditor);

    return () => {
      inputTitleElem.removeEventListener('keydown', focusToNoteEditor);
    };
  }, [noteEditor.commands]);

  return (
    <Box
      data-component="inputs-group-container"
      ref={rootRef}
      sx={{
        flex: 1,
        overflowY: 'auto',
      }}
    >
      <Stack
        sx={{
          px: 2,
          pt: 4,
          pb: 0,
          minHeight: '100%',
          width: '100%',
        }}
      >
        <div>
          <Box
            component="div"
            role="textbox"
            aria-multiline="true"
            aria-label="Title note"
            data-component="input-title"
            data-placeholder="Title note"
            ref={inputTitleElemRef}
            contentEditable={!disabledInputTitle}
            spellCheck={false}
            onInput={handleInputTitle}
            onBlur={handleUpdateInputTitle}
            onPaste={handlePasteInputTitle}
            onFocus={handleFocusInputTitle}
            onPointerDown={handlePointerDownTitle}
            style={{
              wordBreak: disabledInputTitle ? 'break-word' : undefined,
            }}
            sx={(theme) => ({
              borderBottom: 1,
              borderBottomColor: 'grey.300',
              typography: 'h4',
              fontWeight: 'medium',
              pb: 2,
              mb: 2,
              minHeight: theme.typography.h4.fontSize,
              width: '100%',
              overflowY: 'hidden',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              '&:empty:before': {
                content: 'attr(data-placeholder)',
                color: theme.palette.text.disabled,
                pointerEvents: 'none',
              },
              '&:focus': {
                outline: 'none',
              },
            })}
          />
        </div>
        <Stack
          sx={{
            flex: 1,
          }}
        >
          <EditorContent className="flex flex-1 flex-col" editor={noteEditor} />
        </Stack>
      </Stack>
    </Box>
  );
}
