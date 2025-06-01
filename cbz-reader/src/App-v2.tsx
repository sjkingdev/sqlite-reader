import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ImageFile = {
  name: string;
  url: string;
};

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [page, setPage] = useState(0);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render current PDF page to canvas
  const renderPdfPage = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    const page = await pdfDoc.getPage(pageNum + 1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
  };

  // Re-render PDF page on page change
  useEffect(() => {
    if (pdf) {
      renderPdfPage(pdf, page);
    }
  }, [pdf, page]);

  // Handle file input change
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    setImages([]);
    setPdf(null);
    setPage(0);

    if (ext === "cbz" || ext === "zip") {
      // Load zip and extract images
      const zip = await JSZip.loadAsync(file);
      const imageFiles: ImageFile[] = [];

      await Promise.all(
        Object.values(zip.files).map(async (f) => {
          if (!f.dir && /\.(jpe?g|png|gif|bmp|webp)$/i.test(f.name)) {
            const blob = await f.async("blob");
            const url = URL.createObjectURL(blob);
            imageFiles.push({ name: f.name, url });
          }
        })
      );

      imageFiles.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );

      setImages(imageFiles);
    } else if (ext === "pdf") {
      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdf(pdfDoc);
      setPage(0);
    } else if (/\.(jpe?g|png)$/i.test(ext || "")) {
      // Single image file
      setImages([{ name: file.name, url: URL.createObjectURL(file) }]);
    } else {
      alert("Unsupported file type");
    }
  };

  const totalPages = pdf ? pdf.numPages : images.length;

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
        <h2>Reader</h2>
        <input
          type="file"
          accept=".cbz,.zip,.pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
        />
        <p>{totalPages} page{totalPages !== 1 ? "s" : ""} loaded</p>
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
        ) : pdf ? (
          <canvas ref={canvasRef} />
        ) : (
          <p>Please upload a CBZ/ZIP archive, PDF, or image file</p>
        )}
      </main>
    </div>
  );
}
