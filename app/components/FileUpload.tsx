"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2, CheckCircle, AlertCircle, Image, Video } from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  previewUrl?: string;
}

export default function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => {
      const previewUrl = file.type.startsWith('image/') || file.type.startsWith('video/') 
        ? URL.createObjectURL(file) 
        : undefined;

      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: "uploading" as const,
        previewUrl
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload progress
    newFiles.forEach(newFile => {
      simulateUpload(newFile.id);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    multiple: true,
  });

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress: 100, status: "completed" }
              : f
          )
        );
        clearInterval(interval);
      } else {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, progress } : f
          )
        );
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconClass = "w-5 h-5";
    
    if (fileType.startsWith('image/')) return <Image className={`${iconClass} text-emerald-500`} />;
    if (fileType.startsWith('video/')) return <Video className={`${iconClass} text-purple-500`} />;
    if (["pdf"].includes(ext || "")) return <File className={`${iconClass} text-red-500`} />;
    if (["doc", "docx"].includes(ext || "")) return <File className={`${iconClass} text-blue-500`} />;
    if (["xls", "xlsx"].includes(ext || "")) return <File className={`${iconClass} text-green-500`} />;
    return <File className={`${iconClass} text-gray-500`} />;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // Filter files for gallery display
  const mediaFiles = uploadedFiles.filter(file => 
    file.status === "completed" && 
    (file.file.type.startsWith('image/') || file.file.type.startsWith('video/'))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-lg mb-6">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            File Upload Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload your documents, images, and files securely. 
            Supports multiple files with drag & drop functionality.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            relative border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer
            transition-all duration-500 ease-out transform
            ${
              isDragActive || isDragging
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-2xl"
                : "border-gray-300 bg-white/80 hover:border-blue-400 backdrop-blur-sm"
            }
            shadow-xl hover:shadow-2xl group
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className={`
                p-5 rounded-2xl transition-all duration-500 group-hover:scale-110
                ${isDragActive || isDragging 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 scale-110 shadow-lg" 
                  : "bg-gradient-to-r from-gray-100 to-gray-200 shadow-md"
                }
              `}>
                <Upload className={`
                  w-14 h-14 transition-all duration-500
                  ${isDragActive || isDragging ? "text-white" : "text-gray-400"}
                `} />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-gray-900">
                {isDragActive ? "Release to Upload" : "Drag & Drop Files"}
              </h3>
              <p className="text-gray-500 text-lg">
                or <span className="text-blue-500 font-semibold">browse</span> your device
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium shadow-sm">
                Images
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium shadow-sm">
                Videos
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium shadow-sm">
                Documents
              </span>
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium shadow-sm">
                Up to 50MB
              </span>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        {mediaFiles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Image className="w-4 h-4 text-white" />
              </div>
              Media Gallery ({mediaFiles.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden
                           hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {file.file.type.startsWith('image/') ? (
                      <img
                        src={file.previewUrl}
                        alt={file.file.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <video
                        src={file.previewUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300
                               hover:bg-red-600 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-medium text-sm truncate">
                        {file.file.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <File className="w-4 h-4 text-white" />
              </div>
              Uploaded Files ({uploadedFiles.length})
            </h2>
            
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6
                           hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {getFileIcon(file.file.name, file.file.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-lg font-semibold text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          {getStatusIcon(file.status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-md">
                            {formatFileSize(file.file.size)}
                          </span>
                          <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                          <span className={`px-2 py-1 rounded-md font-medium ${
                            file.status === "uploading" ? "bg-blue-100 text-blue-700" :
                            file.status === "completed" ? "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {file.status === "uploading" ? "Uploading..." : 
                             file.status === "completed" ? "Uploaded" : "Error"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {file.status === "uploading" && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                              <span>Uploading...</span>
                              <span className="font-semibold">{Math.round(file.progress)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 
                               transition-all duration-200 rounded-xl
                               hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
              <div className="text-gray-600 text-lg">
                <span className="font-semibold text-green-600">
                  {uploadedFiles.filter(f => f.status === "completed").length}
                </span> of{" "}
                <span className="font-semibold text-gray-800">
                  {uploadedFiles.length}
                </span> files uploaded successfully
              </div>
              
              <button
                onClick={() => {
                  uploadedFiles.forEach(file => {
                    if (file.previewUrl) {
                      URL.revokeObjectURL(file.previewUrl);
                    }
                  });
                  setUploadedFiles([]);
                }}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl
                         hover:from-red-600 hover:to-red-700 transition-all duration-300
                         font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Upload</h3>
            <p className="text-gray-600 leading-relaxed">Your files are encrypted and securely stored with enterprise-grade protection</p>
          </div>
          
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Drag & Drop</h3>
            <p className="text-gray-600 leading-relaxed">Beautiful, intuitive interface for effortless file management and organization</p>
          </div>
          
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Image className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Media Gallery</h3>
            <p className="text-gray-600 leading-relaxed">Automatic image and video previews with beautiful gallery display</p>
          </div>
        </div>
      </div>
    </div>
  );
}