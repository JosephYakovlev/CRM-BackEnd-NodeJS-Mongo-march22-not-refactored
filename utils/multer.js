const multer = require("multer");
const path = require("path");

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) =>{
        let ext = path.extname(body.file.originalname);
        if(ext !== ".jpg" && ext !== ".jpeg" && ext !==".png"){
            cb(new Error("Filetype is not supported"), false);
            return;
        }
        cb(null,true)
    },
});