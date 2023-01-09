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
  .then (deleteImage)
  .then ((product) => res.send({message: product}))
  .catch((err) => res.status (500).send({message: err}))
}
//Suppression de l'image
function deleteImage (product){
  const {imageUrl} = product
  const fileToDelete = imageUrl.split("/").at(-1)
  unlink(`images/${fileToDelete}`, (err) =>{ 
    console.log("suppression du fichier", err)
    throw new Error ("Problème de à la suppression de l'image"+ err)
  })
  return product
}
//Création du produit sauce à partir du shéma
function createSauce(req, res) {
  const {body, file} = req
  const sauce = JSON.parse(req.body.sauce)
  const {fileName} = file
  const {name, manufacturer, description, mainPepper, heat, userId } = sauce

//Insertion de l'image
  function makeImageUrl(req, fileName) {
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
  }
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

module.exports = {getSauces, createSauce, getSauceById, deleteSauce}