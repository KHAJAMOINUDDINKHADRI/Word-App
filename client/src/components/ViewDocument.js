import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Editor,
    EditorState,
    convertFromRaw
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function ViewDocument() {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (documentId && user) {
            loadDocument();
        }
    }, [documentId, user]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = user?.accessToken || localStorage.getItem('googleAccessToken');

            if (!accessToken) {
                throw new Error('No access token available. Please sign in again.');
            }

            const response = await axios.get(`http://localhost:5001/api/documents/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data) {
                setTitle(response.data.title || '');

                // The content is already in Draft.js format from the server
                const contentState = convertFromRaw(JSON.parse(response.data.content));
                setEditorState(EditorState.createWithContent(contentState));
            }
        } catch (error) {
            console.error('Error loading document:', error);
            setError(error.response?.data?.details || error.message || 'Error loading document');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-8 mt-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Please Sign In</h2>
                <p className="text-gray-600 mb-4">You need to sign in with Google to view documents.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                    <button
                        onClick={loadDocument}
                        className="mt-2 text-sm underline"
                    >
                        Try again
                    </button>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                    Back to Documents
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header with back button and title */}
            <div className="p-4 border-b border-gray-200 flex items-center">
                <button
                    onClick={() => navigate('/')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold">{title}</h1>
            </div>

            {/* Document content area (read-only) */}
            <div className="min-h-[500px] p-6">
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    readOnly={true}
                />
            </div>
        </div>
    );
}

export default ViewDocument; 