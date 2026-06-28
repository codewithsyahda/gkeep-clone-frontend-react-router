import StarterKit from '@tiptap/starter-kit';
import { clsx } from 'clsx';

const tiptapConfig = {
  extensions: [StarterKit],
  defaultStyle: clsx(
    '[&>h1]:typography-h5 [&>h2]:typography-h6 flex-1 whitespace-pre-wrap focus:outline-0 [&_ol]:list-decimal [&_ol>li>p]:pl-2 [&_ul]:list-disc [&_ul,&_ol]:ml-2 [&_ul,&_ol]:pl-4 [&>h1]:mb-4 [&>h2]:mt-6 [&>h2,&>p,&_li]:mb-2 [&>h2:first-child]:mt-0',
  ),
};

export default tiptapConfig;
