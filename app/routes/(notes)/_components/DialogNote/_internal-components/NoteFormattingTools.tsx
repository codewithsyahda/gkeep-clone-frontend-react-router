import {
  Editor,
  useEditorState,
  type EditorStateSnapshot,
} from '@tiptap/react';
import {
  BoldIcon,
  CaseSensitiveIcon,
  Heading1Icon,
  Heading2Icon,
  ItalicIcon,
  Redo2,
  RemoveFormattingIcon,
  UnderlineIcon,
  Undo2Icon,
} from 'lucide-react';
import { type RefObject } from 'react';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

const BtnTextFmtTool = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{
  isActive?: boolean;
}>(({ theme, isActive, disabled }) => ({
  backgroundColor: isActive ? theme.palette.grey[300] : 'transparent',
  borderRadius: theme.shape.borderRadius,
  color: disabled ? theme.palette.text.secondary : theme.palette.text.primary,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 36,
  height: 36,
  '&:hover, &:focus-visible': {
    backgroundColor: isActive
      ? theme.palette.grey[300]
      : theme.palette.grey[200],
  },
}));

const editorSelector = (ctx: EditorStateSnapshot<Editor>) => {
  return {
    // Text formatting
    isUnderline: ctx.editor.isActive('underline') ?? false,
    isBold: ctx.editor.isActive('bold') ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive('italic') ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,

    // Block types
    isParagraph: ctx.editor.isActive('paragraph') ?? false,
    isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
    isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,

    // History
    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,
  };
};

export default function NoteFormattingTools({
  dialogFmtMenuRef,
  noteEditor,
}: Readonly<{
  dialogFmtMenuRef: RefObject<HTMLDivElement | null>;
  noteEditor: Editor;
}>) {
  const noteEditorState = useEditorState({
    editor: noteEditor,
    selector: editorSelector,
  });

  return (
    <Box data-component="fmt-menu-container">
      <Stack
        data-component="fmt-menu"
        direction="row"
        ref={dialogFmtMenuRef}
        spacing={1}
        sx={(theme) => ({
          borderTop: 1,
          borderTopColor: 'grey.300',
          py: 0.5,
          overflowX: 'auto',
          '& > *': {
            flexShrink: 0,
          },
          [theme.breakpoints.down(425)]: {
            px: 2,
          },
          [theme.breakpoints.up(425)]: {
            justifyContent: 'center',
          },
        })}
      >
        <Tooltip title="Undo">
          <BtnTextFmtTool
            disabled={!noteEditorState.canUndo}
            onPointerDown={(ev) => {
              const visualViewport = window.visualViewport;

              if (!visualViewport) return;

              const htmlHeight = document.documentElement.clientHeight;

              if (
                (htmlHeight - visualViewport.height > 300 &&
                  ev.pointerType === 'touch') ||
                ev.pointerType === 'mouse'
              ) {
                ev.preventDefault();
                return noteEditor.chain().focus().undo().run();
              }

              noteEditor.chain().undo().run();
            }}
          >
            <Undo2Icon className="size-4" />
          </BtnTextFmtTool>
        </Tooltip>
        <Tooltip title="Redo">
          <BtnTextFmtTool
            disabled={!noteEditorState.canRedo}
            onPointerDown={(ev) => {
              const visualViewport = window.visualViewport;

              if (!visualViewport) return;

              const htmlHeight = document.documentElement.clientHeight;

              if (
                (htmlHeight - visualViewport.height > 300 &&
                  ev.pointerType === 'touch') ||
                ev.pointerType === 'mouse'
              ) {
                ev.preventDefault();
                return noteEditor.chain().focus().redo().run();
              }

              noteEditor.chain().redo().run();
            }}
          >
            <Redo2 className="size-4" />
          </BtnTextFmtTool>
        </Tooltip>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Tooltip title="Heading one">
          <BtnTextFmtTool
            isActive={noteEditorState.isHeading1}
            onClick={() =>
              noteEditor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1Icon className="size-5" />
          </BtnTextFmtTool>
        </Tooltip>
        <Tooltip title="Heading two">
          <BtnTextFmtTool
            isActive={noteEditorState.isHeading2}
            onClick={() =>
              noteEditor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2Icon className="size-5" />
          </BtnTextFmtTool>
        </Tooltip>
        <Tooltip title="Normal">
          <BtnTextFmtTool
            isActive={noteEditorState.isParagraph}
            onClick={() => noteEditor.chain().focus().setParagraph().run()}
          >
            <CaseSensitiveIcon className="size-5" />
          </BtnTextFmtTool>
        </Tooltip>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Tooltip title="Bold">
          <BtnTextFmtTool
            isActive={noteEditorState.isBold}
            onClick={() => noteEditor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-4" />
          </BtnTextFmtTool>
        </Tooltip>
        <Tooltip title="Italic">
          <BtnTextFmtTool
            isActive={noteEditorState.isItalic}
            onClick={() => noteEditor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="size-4" />
          </BtnTextFmtTool>
        </Tooltip>
        <Tooltip title="Underline">
          <BtnTextFmtTool
            isActive={noteEditorState.isUnderline}
            onClick={() => noteEditor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </BtnTextFmtTool>
        </Tooltip>
        <Tooltip title="Clear formatting">
          <BtnTextFmtTool
            disabled={!noteEditorState.canClearMarks}
            onClick={() => noteEditor.chain().focus().unsetAllMarks().run()}
          >
            <RemoveFormattingIcon className="size-4" />
          </BtnTextFmtTool>
        </Tooltip>
      </Stack>
    </Box>
  );
}
