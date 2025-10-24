"use client";

import React from "react";
import FileUpload from "./components/FileUpload";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Media Upload App
      </h1>

      <div className="w-full max-w-md">
        <FileUpload />
      </div>
    </div>
  );
}