const multer = require ("multer")
//"diskStorage" configure le chemin et le nom de fichier pour les fichiers
const storage = multer.diskStorage({
    destination: "images/",
    filename: function (req, file, cb) {
      cb(null, makeFilename(req, file))
    }
  })
// Renomme les fichiers
function makeFilename(req, file) {
    console.log("req, file:", file)
    const fileName = `${Date.now()}-${file.originalname}`.replace(/\s/g, "-")
    file.fileName = fileName
    return fileName
}
const upload =  multer ({ storage })

  module.exports = {upload}