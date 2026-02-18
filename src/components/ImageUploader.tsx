import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { type UseFormRegisterReturn } from "react-hook-form";

interface ImageUploaderProps {
  register: UseFormRegisterReturn; // react-hook-form register prop
  maxFiles?: number;
  maxSizeMB?: number;
}

interface PreviewFile extends File {
  preview: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  register,
  maxFiles = 5,
  maxSizeMB = 5,
}) => {
  const [images, setImages] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: PreviewFile[] = Array.from(files)
      .filter((file) => {
        if (file.size / 1024 / 1024 > maxSizeMB) {
          alert(`${file.name} exceeds ${maxSizeMB}MB limit`);
          return false;
        }
        return true;
      })
      .map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) }),
      );

    setImages((prev) => {
      const combined = [...prev, ...newFiles].slice(0, maxFiles);
      return combined;
    });
  };

  const { ref: registerRef, onChange, ...rest } = register;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      images.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [images]);

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block mb-2 text-gray-700 font-semibold">
        Product Images
      </label>

      <div
        className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition"
        onClick={handleUploadClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <FaCloudUploadAlt className="text-orange-500 text-3xl mb-2" />
        <span className="text-orange-600 font-medium">
          Click to upload
        </span>{" "}
        <span className="text-gray-500">or drag and drop</span>
        <p className="text-gray-400 text-sm mt-1">
          SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          {...rest}
          ref={(e) => {
            registerRef(e);
            fileInputRef.current = e;
          }}
          onChange={(e) => {
            onChange(e);
            handleFiles(e.target.files);
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative w-24 h-24 border rounded overflow-hidden"
            >
              <img
                src={img.preview}
                alt={`upload-${index}`}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
