import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.use(requireAdmin);


router.post('/', async (req, res) => {
  try {
    const { file_data, file_name } = req.body;

    if (!file_data || !file_name) {
      return res.status(400).json({ error: 'file_data and file_name are required' });
    }

    // 1. Clean the base64 string (remove metadata if present)
    const base64Data = file_data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Generate a unique name
    const ext = file_name.split('.').pop() || 'jpg';
    const uniqueName = `poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    
    // 3. Ensure the uploads directory exists
    // We go up two levels from 'server/routes/admin' to reach the 'server' root
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory at:', uploadsDir);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 4. Write the file
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    console.log('✅ Image uploaded successfully:', uniqueName);

    // 5. Return the URL (The frontend proxy handles the /uploads prefix)
    res.json({ url: `http://localhost:5000/uploads/${uniqueName}` });

  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;