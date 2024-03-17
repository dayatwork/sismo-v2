import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// define your extension array
const extensions = [StarterKit];

const Tiptap = ({
  content,
  name,
  editable = true,
}: {
  content: string;
  name?: string;
  editable?: boolean;
}) => {
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
    editable,
  });

  if (!editor) return null;

  return (
    <>
      {editable && <input type="hidden" name={name} value={editor.getHTML()} />}
      <EditorContent
        editor={editor}
        className={`rounded-md bg-background ${editable ? "border" : ""}`}
      />
    </>
  );
};

export default Tiptap;
