"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, Star, Loader2 } from "lucide-react";
import clsx from "clsx";
import { Photo, profilesApi } from "@/lib/profiles";

interface Props {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  max?: number;
}

export function PhotoUploader({ photos, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} photos.`);
      return;
    }

    setUploading(true);
    try {
      const newPhotos: Photo[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files allowed.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be under 5MB.");
          continue;
        }
        const photo = await profilesApi.uploadPhoto(file, photos.length + newPhotos.length);
        newPhotos.push(photo);
      }
      onChange([...photos, ...newPhotos]);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await profilesApi.deletePhoto(photo.id);
      onChange(photos.filter((p) => p.id !== photo.id));
    } catch {
      setError("Failed to delete photo.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">
          Add up to {max} photos. First one becomes your main photo.
        </p>
        <span className="text-xs text-gray-500">{photos.length}/{max}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={clsx(
              "relative aspect-square rounded-xl overflow-hidden border-2 group",
              photo.is_primary ? "border-pink-500" : "border-gray-200"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {photo.is_primary && (
              <div className="absolute top-1 left-1 bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Main
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="p-2 bg-white rounded-full hover:bg-red-50"
                title="Delete photo"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            onClick={handleSelect}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center text-gray-500 hover:text-pink-600 transition disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}