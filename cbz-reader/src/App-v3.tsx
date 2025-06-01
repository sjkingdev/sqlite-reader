import React, { useState } from "react";

type ImageFile = {
  name: string;
  url: string;
};

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [page, setPage] = useState(0);

  // Handle folder (or multiple files) selected
  const onFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Filter for jpg/jpeg/png
    const imageFiles: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (/\.(jpe?g|png)$/i.test(file.name)) {
        const url = URL.createObjectURL(file);
        imageFiles.push({ name: file.name, url });
      }
    }

    // Sort by name (you can improve sorting logic as needed)
    imageFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    setImages(imageFiles);
    setPage(0);
  };

  const totalPages = images.length;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <nav
        style={{
          width: "220px",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
        <h2>Folder Image Reader</h2>
        <input
          type="file"
          {...({ webkitdirectory: "" } as any)}
          multiple
          onChange={onFolderChange}
          // Note: 'directory' and 'mozdirectory' attributes exist but are non-standard
        />
        <p>{totalPages} images loaded</p>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}>
          Prev
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
        <p>
          Page: {page + 1} / {totalPages}
        </p>
      </nav>
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "auto",
        }}
      >
        {images.length ? (
          <img
            src={images[page].url}
            alt={`Page ${page + 1}`}
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <p>Please select a folder containing JPEG or PNG images</p>
        )}
      </main>
    </div>
  );
}
