import { Editor } from "primereact/editor";

export default function RichTextEditor({ ...props }) {
  return (
    <div className="card">
      <Editor {...props} style={{ height: "120px", width: "660px" }} required />
    </div>
  );
}
