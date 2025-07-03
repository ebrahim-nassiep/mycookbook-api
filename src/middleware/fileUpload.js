const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for different file types
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'general';
        
        if (file.fieldname === 'recipeImage') {
            folder = 'recipes';
        } else if (file.fieldname === 'stepImage') {
            folder = 'steps';
        } else if (file.fieldname === 'userAvatar') {
            folder = 'avatars';
        }
        
        const destPath = path.join(uploadDir, folder);
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        
        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// Configure multer upload with size limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files per request
    }
});

// Middleware for different upload scenarios
const uploadMiddleware = {
    // Single recipe main image
    recipeImage: upload.single('recipeImage'),
    
    // Multiple recipe images (gallery)
    recipeImages: upload.array('recipeImages', 5),
    
    // Single step image
    stepImage: upload.single('stepImage'),
    
    // User avatar
    userAvatar: upload.single('userAvatar'),
    
    // Multiple files for rich content
    richContent: upload.fields([
        { name: 'recipeImage', maxCount: 1 },
        { name: 'stepImages', maxCount: 10 },
        { name: 'galleryImages', maxCount: 5 }
    ])
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large. Maximum size is 5MB.' 
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                error: 'Too many files. Maximum is 10 files per request.' 
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
                error: 'Unexpected file field.' 
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({ 
            error: error.message 
        });
    }
    
    return res.status(500).json({ 
        error: 'File upload failed. Please try again.' 
    });
};

// Helper function to get file URL
const getFileUrl = (req, filename) => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${filename}`;
};

// Helper function to delete uploaded files
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    uploadMiddleware,
    handleUploadError,
    getFileUrl,
    deleteFile,
    uploadDir
};