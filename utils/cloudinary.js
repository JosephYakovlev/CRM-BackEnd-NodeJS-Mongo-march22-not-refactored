const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: "stroyka-ru",
    api_key: 391155246477293,
    api_secret: "_6Akrm5MzjOSJ9YrAAnps9LRZjI"
})

module.exports = cloudinary