import multer from 'multer';
import path from 'path';

// ফাইল কোথায় সেভ হবে এবং নাম কী হবে তার কনফিগারেশন
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // প্রজেক্টের রুট ফোল্ডারে uploads ফোল্ডার তৈরি হবে
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// শুধু ছবি (jpg, jpeg, png, webp) এলাও করার ফিল্টার
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;