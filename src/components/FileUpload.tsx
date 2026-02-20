import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import {
  FileUpload,
  type FileUploadHandlerEvent,
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
import { wprest } from "@/utils/wprest";

interface Props {
  onUploadComplete?: (mediaIds: number[]) => void;
  onFileRemove?: (index: number) => void;
}

const MAX_MB = 5;
export default function FileUploadPrime({
  onUploadComplete,
  onFileRemove,
}: Props) {
  const toast = useRef<Toast>(null);
  const [totalSize, setTotalSize] = useState(0);
  const [_, setUploading] = useState(false);
  const [mediaIds, setMediaIds] = useState<number[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fileUploadRef = useRef<FileUpload>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const media = await wprest.uploadMedia(file);

      setMediaIds((prev) => {
        const updated = [...prev, media.id];
        setTimeout(() => onUploadComplete?.(updated), 0);
        return updated;
      });

      toast.current?.show({
        severity: "success",
        summary: "Uploaded",
        detail: file.name,
      });
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Upload Failed",
        detail: file.name,
      });

      // Remove failed file from selectedFiles
      setSelectedFiles((prev) => prev.filter((f) => f !== file));

      // Remove from mediaIds if added (precaution)
      setMediaIds((prev) =>
        prev.filter((_, idx) => selectedFiles[idx] !== file),
      );
    } finally {
      setUploading(false);
    }
  };

  const onSelect = async (e: FileUploadSelectEvent) => {
    const file = e.files[0] as File; // only one file allowed

    setMediaIds([]); // reset old mediaId, will be set after upload

    // Immediately upload the new file
    await handleFileUpload(file);
    // Replace any previously selected file
    setSelectedFiles([file]);

    // Update total size for UI
    setTotalSize(file.size || 0);
  };

  // const onTemplateSelect = (e: FileUploadSelectEvent) => {
  //   let _totalSize = totalSize;
  //   let files = e.files;

  //   for (let i = 0; i < files.length; i++) {
  //     _totalSize += files[i].size || 0;
  //   }

  //   setTotalSize(_totalSize);
  // };

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

  const onTemplateRemove = (
    file: File,
    removeCallback: () => void,
    index: number,
  ) => {
    console.log(file);
    // Update total size
    // setTotalSize((prev) => prev - (file.size || 0));
    setTotalSize(0); // update to zero since only supports 1 image

    // Remove from local state
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaIds((prev) => prev.filter((_, i) => i !== index));

    // Call parent callback
    onFileRemove?.(index);
    onUploadComplete?.(mediaIds);

    // Remove from PrimeReact UI
    removeCallback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const size = MAX_MB;
    const { className, chooseButton } = options;
    // const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize ? (totalSize / (size * 1000000)) * 100 : 0;
    const formatedValue =
      fileUploadRef && fileUploadRef.current
        ? fileUploadRef.current.formatSize(totalSize)
        : "0 B";

    return (
      <div
        className={className + " py-4!"}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
        {/* {uploadButton} */}
        {/* {cancelButton} */}
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
    const typedFile = inFile as File & { objectURL?: string };

    // Check if this file has a mediaId (i.e., upload completed)
    const isUploaded = mediaIds.length > 0 && selectedFiles[0] === typedFile;
    if (!isUploaded)
      return (
        <div className="p-8 flex items-center justify-center">Uploading...</div>
      ); // hide if still uploading

    return (
      <div className="flex items-center justify-between p-2">
        <div className="flex-1 flex items-center gap-2">
          {typedFile.objectURL && (
            <img src={typedFile.objectURL} alt={typedFile.name} width={50} />
          )}
          <span className="text-xs truncate max-w-50">{typedFile.name}</span>
        </div>
        <div className="flex gap-2 items-center">
          <Tag
            value={`${(typedFile.size / 1024).toFixed(1)} KB`}
            severity="warning"
          />
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-outlined"
            onClick={(e) => {
              onTemplateRemove(typedFile, () => props.onRemove?.(e), 0); // index 0 in single-file mode
            }}
          />
        </div>
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div
        className="flex items-center justify-center cursor-pointer flex-col gap-2 py-4 bg-orange-100 active:bg-orange-200/70 border-2 border-dashed border-orange-200"
        onClick={(e) => {
          e.stopPropagation();
          const input = fileUploadRef.current?.getInput();
          input?.click();
        }}
      >
        <IoCloudUploadOutline size={32} />
        <span className="text-xs">
          <span className="text-xs text-orange-400 ">Click to upload</span> or
          drag and drop
        </span>
        <span className="text-xs">SVG, PNG, JPG or GIF (max.{MAX_MB}MB)</span>
      </div>
    );
  };

  const chooseOptions = {
    icon: "pi pi-fw pi-images",
    iconOnly: true,
    className:
      "custom-choose-btn hidden! p-button-rounded p-button-outlined w-8! h-8!",
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

      {/* <FileUpload
        ref={fileUploadRef}
        name="demo[]"
        multiple={false}
        accept="image/*"
        uploadHandler={(event) => {
          const file = event.files[0];

          if (onFileSelect) {
            onFileSelect(file); // 🔥 send to parent (react-hook-form)
          }

          toast.current?.show({
            severity: "success",
            summary: "Selected",
            detail: "File ready for upload",
          });
        }}
        onSelect={(e) => {
          onTemplateSelect(e);

          const file = e.files[0];
          if (onFileSelect) {
            onFileSelect(file); // also capture here
          }
        }}
        maxFileSize={1000000}
        // onUpload={onTemplateUpload}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
      /> */}

      <FileUpload
        ref={fileUploadRef}
        name="files[]"
        multiple={false} // only one file
        accept="image/*"
        customUpload
        maxFileSize={MAX_MB * 1024 * 1024}
        onUpload={onTemplateUpload}
        onError={onTemplateClear}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        uploadHandler={async (e: FileUploadHandlerEvent) => {
          const file = e.files[0] as File;
          await handleFileUpload(file);
        }}
        onRemove={() => {
          setMediaIds([]);
          setSelectedFiles([]);
          onFileRemove?.(0); // index 0 since only one file
          onUploadComplete?.([]);
        }}
        onSelect={onSelect}
        onClear={() => {
          onTemplateClear();
          setMediaIds([]);
          onUploadComplete?.([]);
        }}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
      />
    </div>
  );
}
