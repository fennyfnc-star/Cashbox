import { useState } from "react";
import { Editor, type EditorTextChangeEvent } from "primereact/editor";

export default function RichTextEditor() {
  const [text, setText] = useState<string>("");

  return (
    <div className="card">
      <Editor
        value={text}
        onTextChange={(e: EditorTextChangeEvent) => setText(e.htmlValue || "")}
        style={{ height: "120px" }}
      />
    </div>
  );
}
