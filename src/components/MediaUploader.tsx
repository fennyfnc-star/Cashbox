import { useState } from "react";

const MediaUploader = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Check if wp.media exists
  // @ts-ignore
  if (!window.wp || !window.wp.media) {
    console.error(
      "WordPress media library not available. Did you call wp_enqueue_media()?",
    );
  }

  const openMediaLibrary = () => {
    // @ts-ignore
    const media = wp.media({
      title: "Select or Upload Image",
      button: { text: "Use this image" },
      multiple: false, // single image
    });

    media.on("select", () => {
      const attachment = media.state().get("selection").first().toJSON();
      setImageUrl(attachment.url); // Save image URL
    });

    media.open();
  };

  return (
    <div>
      <button onClick={openMediaLibrary}>Select Image</button>
      {imageUrl && (
        <div style={{ marginTop: "10px" }}>
          <img src={imageUrl} alt="Selected" style={{ maxWidth: "200px" }} />
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
