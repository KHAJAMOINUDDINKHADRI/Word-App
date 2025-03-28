import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, File, Eye, Trash } from 'lucide-react';

function DocumentList() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchDocuments();
    }, [user]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user) {
                setDocuments([]);
                setLoading(false);
                return;
            }

            const accessToken = user?.accessToken || localStorage.getItem('googleAccessToken');

            if (!accessToken) {
                throw new Error('No access token available. Please sign in again.');
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/documents/list`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setDocuments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError(error.message || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        navigate('/new');
    };

    const handleView = (documentId) => {
        navigate(`/view/${documentId}`);
    };

    const handleDelete = async (documentId) => {
        try {
            if (!window.confirm('Are you sure you want to delete this document?')) {
                return;
            }

            const accessToken = user?.accessToken || localStorage.getItem('googleAccessToken');

            if (!accessToken) {
                throw new Error('No access token available. Please sign in again.');
            }

            await axios.delete(`${process.env.REACT_APP_API_URL}/documents/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Remove the deleted document from state
            setDocuments(documents.filter(doc => doc.id !== documentId));
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document. Please try again.');
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Word App</h2>
                <p className="text-gray-600 mb-4">Please sign in with Google to view and manage your documents.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Documents</h1>
                <button
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Document
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                    <button
                        onClick={fetchDocuments}
                        className="mt-2 text-sm underline"
                    >
                        Try again
                    </button>
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">No documents yet</h2>
                    <p className="text-gray-600 mb-4">Create your first document to get started</p>
                    <button
                        onClick={handleCreateNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        Create Document
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <li key={doc.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{doc.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(doc.modifiedTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleView(doc.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                                            title="View Document"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                            title="Delete Document"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default DocumentList; 