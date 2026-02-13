import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import {
  FileUpload,
  type FileUploadHeaderTemplateOptions,
  type FileUploadSelectEvent,
  type FileUploadUploadEvent,
  type ItemTemplateOptions,
} from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function FileUploadPrime() {
  const toast = useRef<Toast>(null);
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef<FileUpload>(null);

  const onTemplateSelect = (e: FileUploadSelectEvent) => {
    let _totalSize = totalSize;
    let files = e.files;

    for (let i = 0; i < files.length; i++) {
      _totalSize += files[i].size || 0;
    }

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = (e: FileUploadUploadEvent) => {
    let _totalSize = 0;

    e.files.forEach((file) => {
      _totalSize += file.size || 0;
    });

    setTotalSize(_totalSize);
    toast.current?.show({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  const onTemplateRemove = (file: File, callback: Function) => {
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const size = 1;
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / (size * 10000);
    const formatedValue =
      fileUploadRef && fileUploadRef.current
        ? fileUploadRef.current.formatSize(totalSize)
        : "0 B";

    return (
      <div
        className={className + " py-2!"}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs">
            {formatedValue} / {size} MB
          </span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: "10rem", height: "6px" }}
          ></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
    const file = inFile as File & { objectURL: string };
    return (
      <div className="flex items-center justify-between h-16! p-0!">
        <div className="flex-1 flex">
          <img
            alt={file.name}
            role="presentation"
            src={file.objectURL}
            width={50}
          />
          <span className="flex flex-col w-[50%] text-left ml-3">
            <span className="text-xs">{file.name}</span>
            <span className="text-xs">{new Date().toLocaleDateString()}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Tag
            value={props.formatSize}
            severity="warning"
            className="px-3 py-2 bg-transparent! text-neutral-500!"
          />
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-outlined p-button-rounded p-button-danger ml-auto"
            onClick={() => onTemplateRemove(file, props.onRemove)}
          />
        </div>
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex items-center justify-center flex-col">
        <IoCloudUploadOutline size={32} />
        <span className="text-xs">Drag and Drop Image Here</span>
      </div>
    );
  };

  const chooseOptions = {
    icon: "pi pi-fw pi-images",
    iconOnly: true,
    className: "custom-choose-btn p-button-rounded p-button-outlined w-8! h-8!",
  };
  const uploadOptions = {
    icon: "pi pi-fw pi-cloud-upload",
    iconOnly: true,
    className:
      "custom-upload-btn p-button-success p-button-rounded p-button-outlined w-8! h-8!",
  };
  const cancelOptions = {
    icon: "pi pi-fw pi-times",
    iconOnly: true,
    className:
      "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined w-8! h-8!",
  };

  return (
    <div>
      <Toast ref={toast}></Toast>

      <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
      <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
      <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

      <FileUpload
        ref={fileUploadRef}
        name="demo[]"
        url="/api/upload"
        multiple
        accept="image/*"
        maxFileSize={1000000}
        onUpload={onTemplateUpload}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
      />
    </div>
  );
}
