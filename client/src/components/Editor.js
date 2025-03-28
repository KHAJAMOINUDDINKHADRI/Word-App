import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Editor,
    EditorState,
    RichUtils,
    convertToRaw,
    convertFromRaw,
    getDefaultKeyBinding
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Bold, Italic, Underline, ArrowLeft, Save } from 'lucide-react';

function TextEditor() {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (documentId && user) {
            loadDocument();
        }
    }, [documentId, user]);

    const loadDocument = async () => {
        try {
            const accessToken = user?.accessToken || localStorage.getItem('googleAccessToken');

            if (!accessToken) {
                throw new Error('No access token available. Please sign in again.');
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/documents/${documentId}`, {
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
            alert(error.response?.data?.details || error.message || 'Error loading document');
        }
    };

    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const handleKeyBinding = (e) => {
        return getDefaultKeyBinding(e);
    };

    const handleSave = async () => {
        try {
            const accessToken = user?.accessToken || localStorage.getItem('googleAccessToken');

            if (!accessToken) {
                throw new Error('No access token available. Please sign in again.');
            }

            if (!title.trim()) {
                alert('Please enter a document title');
                return;
            }

            setSaving(true);
            const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

            let endpoint = `${process.env.REACT_APP_API_URL}/documents/save`;
            let method = 'post';

            // If we're editing an existing document, use update endpoint
            if (documentId) {
                endpoint = `${process.env.REACT_APP_API_URL}/documents/${documentId}`;
                method = 'put';
            }

            const response = await axios({
                method,
                url: endpoint,
                data: { title, content },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Document saved:', response.data);
            alert('Document saved successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error saving document:', error);
            alert(error.response?.data?.details || error.message || 'Error saving document. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleInlineStyle = (style) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    const formatText = (style) => {
        if (style === 'bold') {
            handleInlineStyle('BOLD');
        } else if (style === 'italic') {
            handleInlineStyle('ITALIC');
        } else if (style === 'underline') {
            handleInlineStyle('UNDERLINE');
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-8 mt-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Please Sign In</h2>
                <p className="text-gray-600 mb-4">You need to sign in with Google to create or edit documents.</p>
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header with back button, title input and save button */}
            <div className="p-4 border-b border-gray-200 flex items-center">
                <button
                    onClick={() => navigate('/')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    placeholder="Document Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-grow px-2 py-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />
                <button
                    onClick={handleSave}
                    disabled={saving || !title}
                    className={`ml-4 px-4 py-2 rounded-md font-medium flex items-center ${saving || !title ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors`}
                >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Formatting toolbar */}
            <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                <button
                    onClick={() => formatText("bold")}
                    className={`p-1.5 hover:bg-gray-200 rounded ${editorState.getCurrentInlineStyle().has('BOLD') ? 'bg-gray-200' : ''}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => formatText("italic")}
                    className={`p-1.5 hover:bg-gray-200 rounded ${editorState.getCurrentInlineStyle().has('ITALIC') ? 'bg-gray-200' : ''}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => formatText("underline")}
                    className={`p-1.5 hover:bg-gray-200 rounded ${editorState.getCurrentInlineStyle().has('UNDERLINE') ? 'bg-gray-200' : ''}`}
                    title="Underline"
                >
                    <Underline className="w-4 h-4" />
                </button>
            </div>

            {/* Editor area */}
            <div className="min-h-[500px] p-4 focus:outline-none">
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={handleKeyBinding}
                    placeholder="Start writing..."
                />
            </div>
        </div>
    );
}

export default TextEditor; 