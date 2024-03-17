// import { memo } from "react";
import { type BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";

import { useTheme } from "~/routes/action.set-theme";
import { memo } from "react";

function _Editor({
  initialContent,
  onChange,
  editable = true,
  uploadFile,
}: {
  initialContent: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  uploadFile?: (file: File) => Promise<string>;
}) {
  const theme = useTheme();

  const editor: BlockNoteEditor = useBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor) => {
      onChange?.(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    editable,
    uploadFile,
  });

  return <BlockNoteView editor={editor} theme={theme} />;
}

export const Editor = memo(_Editor);
