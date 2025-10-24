"use client";

import {
    ImageKitUploadNetworkError,
    ImageKitServerError,
    upload,
} from "@imagekit/next";
import { useState } from "react";

interface FileUploadProps {
    fileType?: "image" | "video";
}

const FileUpload = ({ fileType = "image" }: FileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null); // 👈 for preview
    const [progress, setProgress] = useState<number>(0);

    const validateFile = (file: File) => {
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
                publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
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

            // ✅ show uploaded image or video
            setFileUrl(res.url);
        } catch (error) {
            console.error("Upload Failed", error);
            if (error instanceof ImageKitUploadNetworkError)
                setError("Network error during upload.");
            else if (error instanceof ImageKitServerError)
                setError("Server error during upload.");
            else setError("Unknown error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg w-full max-w-md mx-auto">
            <input
                type="file"
                accept={fileType === "video" ? "video/*" : "image/*"}
                onChange={handleMediaUpload}
                disabled={uploading}
                className="border p-2 rounded-md cursor-pointer w-full"
            />

            {uploading && (
                <p className="text-blue-500 font-medium">
                    Uploading... {progress}%
                </p>
            )}

            {error && <p className="text-red-500">{error}</p>}

            {/* ✅ Preview section */}
            {fileUrl && (
                <div className="mt-4 w-full flex flex-col items-center">
                    {fileType === "video" ? (
                        <video
                            src={fileUrl}
                            controls
                            className="w-full max-w-sm rounded-lg shadow-lg"
                        />
                    ) : (
                        <img
                            src={fileUrl}
                            alt="Uploaded preview"
                            className="w-full max-w-sm rounded-lg shadow-lg"
                        />
                    )}
                    <p className="text-gray-600 mt-2 text-sm break-all">{fileUrl}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;