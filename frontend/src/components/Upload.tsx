import React, { useState } from 'react';
import { uploadStatement, UploadSummary } from '../api/endpoints';
import { Upload as UploadIcon, Check, AlertCircle } from 'lucide-react';

const Upload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UploadSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const res = await uploadStatement(file);
            setResult(res);
        } catch (err) {
            setError('Failed to upload statement. Please check the file format.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Statement</h2>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                        type="file"
                        accept=".pdf,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadIcon size={48} className="text-blue-400 dark:text-blue-300 mb-4" />
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            {file ? file.name : 'Click to upload PDF or CSV'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">ICICI Bank Statements supported</span>
                    </label>
                </div>

                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Processing...' : 'Upload & Parse'}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center space-x-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-4">
                        <Check className="text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Upload Successful</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">New Added</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.new_added}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Existing</p>
                            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">{result.existing}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Processed</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.new_added + result.existing}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
