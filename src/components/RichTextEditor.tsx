import { Editor } from "primereact/editor";

export default function RichTextEditor({ ...props }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"], // ✅ keep link
      ["clean"], // ❌ removed "image"
    ],
  };

  return (
    <div className="card">
      <Editor {...props} modules={modules}  headerTemplate={<></>} style={{ height: "120px" }} />
    </div>
  );
}
