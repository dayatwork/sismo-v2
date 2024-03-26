// import { memo } from "react";
import "@blocknote/core/fonts/inter.css";
import { type BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";

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

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    // onEditorContentChange: (editor) => {
    //   onChange?.(JSON.stringify(editor.topLevelBlocks, null, 2));
    // },

    // editable,
    uploadFile,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      onChange={() => {
        onChange?.(JSON.stringify(editor.document));
      }}
    />
  );
}

export const Editor = memo(_Editor);
