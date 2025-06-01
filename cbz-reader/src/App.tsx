import React, { useState } from "react";

type ImageFile = {
  name: string;
  url: string;
};

type Comic = {
  id: string; // unique id per comic (can be folder name or generated)
  title: string;
  images: ImageFile[];
};

export default function App() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [selectedComicId, setSelectedComicId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Save comic metadata to backend (optional)
  const saveComicToDb = async (comic: Comic) => {
    try {
      await fetch("http://localhost:4000/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: comic.title,
          folder_path: comic.id,
          cover_image: comic.images[0]?.name || "",
          total_pages: comic.images.length,
        }),
      });
    } catch (err) {
      console.error("Error saving comic:", err);
    }
  };

  // Handle folder input, can add multiple comics (folders)
  const onFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Group files by folder name (webkitRelativePath: "folderName/image.jpg")
    const grouped: Record<string, ImageFile[]> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (/\.(jpe?g|png)$/i.test(file.name)) {
        const url = URL.createObjectURL(file);
        const relativePath = (file as any).webkitRelativePath || "";
        const folderName = relativePath.split("/")[0] || "Unknown";

        if (!grouped[folderName]) grouped[folderName] = [];
        grouped[folderName].push({ name: file.name, url });
      }
    }

    // Create Comic objects and add to state
    const newComics: Comic[] = Object.entries(grouped).map(([folderName, images]) => {
      images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      return {
        id: folderName,
        title: folderName,
        images,
      };
    });

    // Add to existing comics
    setComics((prev) => [...prev, ...newComics]);

    // Optionally save each comic to backend
    newComics.forEach(saveComicToDb);

    // Select first newly added comic and reset page
    if (newComics.length > 0) {
      setSelectedComicId(newComics[0].id);
      setPage(0);
    }
  };

  // Get currently selected comic
  const selectedComic = comics.find((c) => c.id === selectedComicId);

  const totalPages = selectedComic?.images.length || 0;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <nav
        style={{
          width: "280px",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <h2>Comics Library</h2>
        <input
          type="file"
          {...({ webkitdirectory: "" } as any)}
          multiple
          onChange={onFolderChange}
        />
        <hr />
        <h3>Available Comics</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {comics.map((comic) => (
            <li
              key={comic.id}
              onClick={() => {
                setSelectedComicId(comic.id);
                setPage(0);
              }}
              style={{
                cursor: "pointer",
                padding: "0.5rem",
                backgroundColor: comic.id === selectedComicId ? "#ddd" : "transparent",
                borderRadius: "4px",
                marginBottom: "0.3rem",
              }}
              title={`${comic.title} (${comic.images.length} pages)`}
            >
              {comic.title}
            </li>
          ))}
          {comics.length === 0 && <li>No comics loaded</li>}
        </ul>
        {selectedComic && (
          <>
            <hr />
            <p>
              <strong>{selectedComic.title}</strong> - {totalPages} pages
            </p>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}>
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ marginLeft: "0.5rem" }}
            >
              Next
            </button>
            <p>
              Page: {page + 1} / {totalPages}
            </p>
          </>
        )}
      </nav>
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "auto",
          backgroundColor: "#222",
        }}
      >
        {selectedComic && selectedComic.images.length ? (
          <img
            src={selectedComic.images[page].url}
            alt={`Page ${page + 1}`}
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <p style={{ color: "#888" }}>Select a comic folder containing JPEG or PNG images</p>
        )}
      </main>
    </div>
  );
}
