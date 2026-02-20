import { Editor } from "primereact/editor";

export default function RichTextEditor({ ...props }) {
  return (
    <div className="card">
      <Editor
        {...props}
        style={{ height: "120px", maxWidth: "660px" }}
        className="text-wrap wrap-break-word"
        required
      />
    </div>
  );
}
