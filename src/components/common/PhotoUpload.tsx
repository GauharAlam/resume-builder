import React, { useRef, useState } from 'react';
import { useResume } from '@/hooks';
import { Camera, Upload, X, User } from 'lucide-react';

const PhotoUpload: React.FC = () => {
    const { resumeData, updateField } = useResume();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, etc.)');
            return;
        }

        // Max file size: 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;

            // Create an image to resize if needed
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 400; // Max dimension
                let { width, height } = img;

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const resizedImage = canvas.toDataURL('image/jpeg', 0.9);

                    updateField('personalDetails', {
                        ...resumeData.personalDetails,
                        photo: resizedImage,
                    });
                }
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removePhoto = () => {
        updateField('personalDetails', {
            ...resumeData.personalDetails,
            photo: undefined,
        });
    };

    const photo = resumeData.personalDetails.photo;

    return (
        <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Profile Photo
            </label>

            {photo ? (
                <div className="relative inline-block">
                    <img
                        src={photo}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                    />
                    <button
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md"
                        title="Remove photo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1.5 rounded-full hover:bg-indigo-600 transition-colors shadow-md"
                        title="Change photo"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
            w-full h-32 border-2 border-dashed rounded-xl cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-all duration-200
            ${isDragging
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }
          `}
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            <span className="text-indigo-600 font-medium">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            JPG, PNG up to 5MB
                        </p>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                💡 Tip: Use the "📷 Photo" template to display your photo on the resume
            </p>
        </div>
    );
};

export default PhotoUpload;
