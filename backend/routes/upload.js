const express = require('express');
const router  = express.Router();
const { upload } = require('../middleware/cloudinary');

/**
 * POST /api/upload
 * Accepts: multipart/form-data with field "image"
 * Returns: { secure_url: string }
 */
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    // multer-storage-cloudinary stores the Cloudinary URL in req.file.path
    res.json({ secure_url: req.file.path });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
