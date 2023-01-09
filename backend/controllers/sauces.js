const mongoose = require("mongoose")
const { authenticateUser } = require("../middleware/auth")
const { unlink } = require("fs/promises")

//Création du shéma sur mongoose
const productSchema = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: { type: Number, min: 1, max: 5 },
  likes: Number,
  dislikes: Number,
  usersLiked: [String],
  usersDisliked: [String]
})
const Product = mongoose.model("Product", productSchema)
  
function getSauces(req, res) {
  Product.find({})
  .then(products=> res.send(products))
  .catch(error => res.status (500).send(error))
}

//Création de la fiche produit de la sauce
function getSauceById (req, res){
  const { id } = req.params
  Product.findById(id)
  .then (product => res.send(product))
  .catch(console.error)
}
//Supression de la sauce
function deleteSauce (req, res){
  const { id } = req.params
  Product.findByIdAndDelete(id)
//.then (deleteImage)
  .then ((product) => sendClientResponse (product, res))
  .then((item) => deleteImage(item))
  .then((res) => console.log("File delted", res))
  .catch((err) => res.status(500).send({message: err}))

}

//Modification de la sauce
function modifySauce(req, res) {
  const {
    params: {id}
  } = req
 
  console.log("req.file", req.file)

  const hasNewImage = req.file != null
  const payload = makePayload(hasNewImage, req)
  if (!hasNewImage) payload = req.body
  console.log("hasNewImage:", hasNewImage)

  Product.findByIdAndUpdate(id, payload)
  .then ((dbResponse) => sendClientResponse (dbResponse, res))
  .then((product) => deleteImage(product))
  .then((res) => console.log("File delted", res))
  .catch((err) => console.error ("probleme and updatin", err))
}

//Suppression de l'image
function deleteImage (product){
 // const {imageUrl} = product
 // const fileToDelete = imageUrl.split("/").at(-1)
  if (product == null) return
  console.log("delete image", product)
  const imageToDelete = product.imageUrl.split("/").at(-1)  
  return unlink("images/" +  imageToDelete)

}

//Confirmation de la bonne insertion de la nouvelle image
function makePayload (hasNewImage, req) {
  console.log("hasNewImage:", hasNewImage)
  if (!hasNewImage) return req.body
  const payload = JSON.parse (req.body.sauce)
  payload.imageUrl = makeImageUrl (req, req.file.fileName)
  console.log("nouvelle image à gérer")
  console.log("voici le payload:", payload)
  return payload
}

// Fonction réponse au client en fonction de la base de données
function sendClientResponse (product, res){
  if (product == null) {
    console.log("nothin to update")
    return res.status(404).send({message:"object not find in database"})
  } 
    console.log("all good to update:", product)
    return Promise.resolve(res.status(200).send({message: "succesfully updated"})).then(() => product)
}

function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
  }

//Création du produit sauce à partir du shéma
function createSauce(req, res) {
  const {body, file} = req
  const sauce = JSON.parse(req.body.sauce)
  const {fileName} = file
  const {name, manufacturer, description, mainPepper, heat, userId } = sauce

//Insertion de l'image
 
  const product = new Product({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper,
    imageUrl: makeImageUrl(req, fileName),
    heat: heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  })
  product
    .save()
    .then((message) => res.status(201).send({ message }))
    .catch((err) => res.status(500).send(err))
}

module.exports = {getSauces, createSauce, getSauceById, deleteSauce, modifySauce}