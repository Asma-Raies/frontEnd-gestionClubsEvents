"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadFilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);

    if (selected && selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Uploaded successfully!");
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-sm space-y-4">
      <h2 className="text-xl font-bold">Upload File</h2>

      <Input type="file" onChange={handleSelectFile} />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mt-3 w-full h-48 object-cover rounded-lg border"
        />
      )}

      <Button onClick={handleUpload} className="w-full">
        Upload
      </Button>
    </div>
  );
}
