const express = require('express');
const path = require('path');
const { uploadMiddleware, handleUploadError, getFileUrl } = require('../middleware/fileUpload');

const router = express.Router();

// Upload single recipe image
router.post('/recipe-image', uploadMiddleware.recipeImage, handleUploadError, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileUrl = getFileUrl(req, `recipes/${req.file.filename}`);
        
        res.status(200).json({
            message: 'Recipe image uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: fileUrl,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Recipe image upload error:', error);
        res.status(500).json({ error: 'Failed to upload recipe image' });
    }
});

// Upload multiple recipe images
router.post('/recipe-images', uploadMiddleware.recipeImages, handleUploadError, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            url: getFileUrl(req, `recipes/${file.filename}`),
            path: file.path
        }));
        
        res.status(200).json({
            message: 'Recipe images uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Recipe images upload error:', error);
        res.status(500).json({ error: 'Failed to upload recipe images' });
    }
});

// Upload step image
router.post('/step-image', uploadMiddleware.stepImage, handleUploadError, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileUrl = getFileUrl(req, `steps/${req.file.filename}`);
        
        res.status(200).json({
            message: 'Step image uploaded successfully',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: fileUrl,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Step image upload error:', error);
        res.status(500).json({ error: 'Failed to upload step image' });
    }
});

// Upload rich content (multiple file types)
router.post('/rich-content', uploadMiddleware.richContent, handleUploadError, (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const uploadedFiles = {};
        
        // Process each file type
        Object.keys(req.files).forEach(fieldName => {
            const files = req.files[fieldName];
            uploadedFiles[fieldName] = files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                url: getFileUrl(req, `${file.destination.split('/').pop()}/${file.filename}`),
                path: file.path
            }));
        });
        
        res.status(200).json({
            message: 'Rich content uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Rich content upload error:', error);
        res.status(500).json({ error: 'Failed to upload rich content' });
    }
});

// Delete uploaded file
router.delete('/file/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const { folder } = req.query; // recipes, steps, avatars
        
        if (!filename || !folder) {
            return res.status(400).json({ error: 'Filename and folder are required' });
        }
        
        const filePath = path.join(__dirname, '../../uploads', folder, filename);
        const fs = require('fs');
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;