const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const admin = require('firebase-admin');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        // const decodedToken = await admin.auth().verifyIdToken(token);
        req.token = token;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Save document to Google Drive
router.post('/save', async (req, res) => {
    try {
        const { title, content } = req.body;
        const accessToken = req.headers.authorization?.split('Bearer ')[1];

        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        console.log('Attempting to save document with title:', title);

        // Create a new OAuth2 client and set credentials
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        // Initialize Google Drive API
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Extract plain text from Draft.js content
        let plainText = '';
        let contentObj;

        try {
            // Parse the content if it's a string
            contentObj = typeof content === 'string' ? JSON.parse(content) : content;

            // Extract text from blocks
            plainText = contentObj.blocks
                .map(block => block.text)
                .join('\n\n');
        } catch (e) {
            console.error('Error parsing content:', e);
            plainText = 'Document content could not be processed';
        }

        // First, check if we have a Word App folder already, if not create one
        let folderId;

        // Find the Word App folder
        const folderResponse = await drive.files.list({
            q: "name='Word App Documents' and mimeType='application/vnd.google-apps.folder'",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        // If folder exists, use it; otherwise create a new folder
        if (folderResponse.data.files && folderResponse.data.files.length > 0) {
            folderId = folderResponse.data.files[0].id;
            console.log('Using existing Word App folder:', folderId);
        } else {
            // Create a new folder for Word App documents
            const folderMetadata = {
                name: 'Word App Documents',
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folderCreation = await drive.files.create({
                requestBody: folderMetadata,
                fields: 'id'
            });

            folderId = folderCreation.data.id;
            console.log('Created new Word App folder:', folderId);
        }

        // Create the document file directly in the Word App folder
        const fileMetadata = {
            name: title,
            mimeType: 'text/plain',
            parents: [folderId],
            appProperties: {
                isWordAppDocument: 'true'
            }
        };

        const fileMedia = {
            mimeType: 'text/plain',
            body: plainText
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: fileMedia,
            fields: 'id, name, webViewLink'
        });

        console.log('Created document file:', response.data.id);

        res.json({
            message: 'Document saved successfully',
            documentId: response.data.id,
            title: response.data.name,
            webViewLink: response.data.webViewLink
        });
    } catch (error) {
        console.error('Error saving document:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401 || error.message.includes('Invalid Credentials')) {
            return res.status(401).json({
                error: 'Authentication failed',
                details: 'Your Google access token may have expired. Please sign in again.'
            });
        }

        res.status(500).json({
            error: 'Error saving document',
            details: error.message,
            stack: error.stack
        });
    }
});

// Get user's documents from Google Drive
router.get('/list', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split('Bearer ')[1];

        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        // Create a new OAuth2 client and set credentials
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // First, get the Word App Documents folder
        const folderResponse = await drive.files.list({
            q: "name='Word App Documents' and mimeType='application/vnd.google-apps.folder'",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        // No folder found, return empty list
        if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
            return res.json([]);
        }

        const folderId = folderResponse.data.files[0].id;

        // List text files within Word App Documents folder
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='text/plain' and appProperties has { key='isWordAppDocument' and value='true' }`,
            fields: 'files(id, name, modifiedTime, webViewLink)',
            orderBy: 'modifiedTime desc'
        });

        res.json(response.data.files);
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({
            error: 'Error listing documents',
            details: error.message
        });
    }
});

// Get document content
router.get('/:documentId', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split('Bearer ')[1];

        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        // Create a new OAuth2 client and set credentials
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Get the file metadata
        const metadataResponse = await drive.files.get({
            fileId: req.params.documentId,
            fields: 'name'
        });

        // Get the text content
        const contentResponse = await drive.files.get({
            fileId: req.params.documentId,
            alt: 'media'
        });

        // Get plain text content
        const plainText = typeof contentResponse.data === 'string'
            ? contentResponse.data
            : '';

        // Convert plain text to Draft.js format for the viewer
        const blocks = plainText.split('\n\n')
            .filter(para => para.trim() !== '')
            .map(para => ({
                text: para,
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {}
            }));

        if (blocks.length === 0) {
            blocks.push({
                text: '',
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {}
            });
        }

        // Create Draft.js content for the viewer
        const draftJsContent = JSON.stringify({
            blocks,
            entityMap: {}
        });

        res.json({
            title: metadataResponse.data.name,
            content: draftJsContent,
            documentId: req.params.documentId
        });
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).json({
            error: 'Error getting document',
            details: error.message
        });
    }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split('Bearer ')[1];

        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        // Create a new OAuth2 client and set credentials
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Delete the file
        await drive.files.delete({
            fileId: req.params.documentId
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            error: 'Error deleting document',
            details: error.message
        });
    }
});

module.exports = router; 