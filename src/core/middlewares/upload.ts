import * as multer from 'multer';

export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
}).any();                       
