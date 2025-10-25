"use client";

import React, { useState } from "react";
import {
  ImageKitUploadNetworkError,
  ImageKitServerError,
  upload,
} from "@imagekit/next";

const FileUpload: React.FC = () => {
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const validateFile = (file: File): boolean => {
    if (fileType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a valid video file");
      return false;
    }
    if (fileType === "image" && !file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size should be less than 100 MB.");
      return false;
    }
    return true;
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);
    setFileUrl(null);
    setProgress(0);

    try {
      const authRes = await fetch("/api/auth/imagekit_auth");
      const auth = await authRes.json();

      const res = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY ?? "",
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            setProgress(Math.round(percent));
          }
        },
      });

      setFileUrl(res.url ?? null);
    } catch (err: unknown) {
      console.error("Upload Failed", err);
      if (err instanceof ImageKitUploadNetworkError) {
        setError("Network error during upload.");
      } else if (err instanceof ImageKitServerError) {
        setError("Server error during upload.");
      } else {
        setError("Unknown error occurred during upload.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full h-auto bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="flex flex-col gap-8 pt-8 justify-center items-center h-auto p-4">
        <h1 className="text-black text-3xl font-bold">Compress your Files</h1>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 transition-transform hover:scale-[1.01]">

          {/* 🔘 File type toggle */}
          <div className="flex justify-center gap-3 mb-2">
            <button
              onClick={() => setFileType("image")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${fileType === "image"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Image
            </button>
            <button
              onClick={() => setFileType("video")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${fileType === "video"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Video
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Upload {fileType === "video" ? "Video" : "Image"}
            </h2>
            <span className="text-sm text-gray-500">
              {fileType === "video" ? "MP4, MOV, etc." : "JPG, PNG, etc."}
            </span>
          </div>

          {/* Upload area */}
          <label
            htmlFor="file-upload"
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 ${uploading
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0l-3 3m3-3l3 3M17 8v12m0 0l-3-3m3 3l3-3"
              />
            </svg>
            <p className="text-gray-600 text-sm text-center">
              {uploading ? "Uploading..." : "Click or drag to upload file"}
            </p>
            <input
              id="file-upload"
              type="file"
              accept={fileType === "video" ? "video/*" : "image/*"}
              onChange={handleMediaUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Progress bar */}
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-md py-2">
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="w-screen h-auto grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 px-12 py-16">
        {fileUrl && (
        <div className="mt-4 w-full flex flex-col items-cente bg-slate-900 p-4 rounded-2xl hover:scale-105 transition-all duration-500">
          <div className="rounded-xl overflow-hidden shadow-md w-full">
            {fileType === "video" ? (
              <video src={fileUrl} controls className="w-full h-auto" />
            ) : (
              <img
                src={fileUrl}
                alt="Uploaded preview"
                className="w-full h-auto object-cover"
              />
            )}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(fileUrl)}
            className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm shadow-md transition"
          >
            Copy URL
          </button>
          <p className="text-gray-500 text-xs mt-2 break-all">{fileUrl}</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default FileUpload;
