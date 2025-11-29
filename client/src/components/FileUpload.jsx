import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

const FileUpload = ({ onFileUpload, darkMode }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer group ${darkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-blue-500 hover:bg-gray-750'
                    : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 shadow-sm'
                }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />

            <div className="relative">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all ${darkMode ? 'bg-gray-700 group-hover:bg-blue-600' : 'bg-blue-50 group-hover:bg-blue-100'
                    }`}>
                    <Upload className={`w-10 h-10 transition-colors ${darkMode ? 'text-blue-400 group-hover:text-white' : 'text-blue-600 group-hover:text-blue-700'
                        }`} />
                </div>

                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Upload Your CSV File
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Drag and drop your CBE export file here, or click to browse
                </p>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                    <FileText className="w-4 h-4" />
                    <span>Accepts .csv files only</span>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
