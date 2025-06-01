import React, { useState } from "react";

type ImageFile = {
  name: string;
  url: string;
};

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [page, setPage] = useState(0);

  // Send comic metadata to backend SQLite server
  const saveComicToDb = async (folderName: string, imageFiles: ImageFile[]) => {
    const body = {
      title: folderName,
      folder_path: folderName,
      cover_image: imageFiles[0]?.name || "",
      total_pages: imageFiles.length,
    };

    try {
      const res = await fetch("http://localhost:4000/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log("Saved to DB:", data);
    } catch (err) {
      console.error("Error saving comic:", err);
    }
  };

  // Handle folder (or multiple files) selected
  const onFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    let folderName = "";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (/\.(jpe?g|png)$/i.test(file.name)) {
        const url = URL.createObjectURL(file);
        imageFiles.push({ name: file.name, url });

        if (!folderName) {
          const parts = (file as any).webkitRelativePath?.split("/");
          if (parts && parts.length > 1) folderName = parts[0];
        }
      }
    }

    imageFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    setImages(imageFiles);
    setPage(0);

    if (imageFiles.length && folderName) {
      saveComicToDb(folderName, imageFiles);
    }
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
