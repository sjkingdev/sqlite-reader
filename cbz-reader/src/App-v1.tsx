// src/App.tsx
import React, { useState, useEffect } from "react";
import JSZip from "jszip";

type ImageFile = {
  name: string;
  url: string;
};

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [page, setPage] = useState(0);

  // Load zip file, extract images as blobs URLs
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);

    const imageFiles: ImageFile[] = [];
    await Promise.all(
      Object.values(loaded.files).map(async (f) => {
        if (!f.dir && /\.(jpe?g|png|gif|bmp|webp)$/i.test(f.name)) {
          const blob = await f.async("blob");
          const url = URL.createObjectURL(blob);
          imageFiles.push({ name: f.name, url });
        }
      })
    );

    // Sort images by name (you might want to improve sorting for real comics)
    imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    setImages(imageFiles);
    setPage(0);
  };

  const totalPages = images.length;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <nav style={{
        width: "220px",
        borderRight: "1px solid #ccc",
        padding: "1rem",
        boxSizing: "border-box"
      }}>
        <h2>CBZ Reader</h2>
        <input type="file" accept=".cbz,.zip" onChange={onFileChange} />
        <p>{totalPages} pages loaded</p>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}>
          Prev
        </button>
        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
          Next
        </button>
        <p>Page: {page + 1} / {totalPages}</p>
      </nav>
      <main style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {images.length ? (
          <img
            src={images[page].url}
            alt={`Page ${page + 1}`}
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <p>Please upload a CBZ/ZIP file with images</p>
        )}
      </main>
    </div>
  );
}
