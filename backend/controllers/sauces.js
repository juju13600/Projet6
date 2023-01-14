const mongoose = require("mongoose")
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
  .then((products)=> res.send(products))
  .catch((error) => res.status (500).send(error))
}

function getSauce(req, res) {
  const { id } = req.params
  return Product.findById(id)
}
//Création de la fiche produit de la sauce
function getSauceById (req, res){
  getSauce (req,res)
  .then ((product) => sendClientResponse(product, res))
  .catch((err) => res.status(500).send(err))
}

//Supression de la sauce
function deleteSauce (req, res){
  const { id } = req.params
  Product.findByIdAndDelete(id)
  .then((product) => sendClientResponse (product, res))
  .then((item) => deleteImage(item))
  .then((res) => console.log("File deleted", res))
  .catch((err) => res.status(500).send({message: err}))

}

//Modification de la sauce
function modifySauce(req, res) {
  const {
    params: {id}
  } = req
 
  const hasNewImage = req.file != null
  const payload = makePayload(hasNewImage, req)

  Product.findByIdAndUpdate(id, payload)
  .then ((dbResponse) => sendClientResponse (dbResponse, res))
  .then((product) => deleteImage(product))
  .then((res) => console.log("File deleted", res))
  .catch((err) => console.error ("probleme and updating", err))
}

//Suppression de l'image
function deleteImage (product){
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
    return Promise.resolve(res.status(200).send(product)).then(() => product)
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

function likeSauce(req, res) {
  const { like, userId } = req.body
  if (![1, -1, 0].includes(like)) return res.status(403).send({ message: "Invalid like value" })

  getSauce(req, res)
    .then((product) => updateVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => sendClientResponse(prod, res))
    .catch((err) => res.status(500).send(err))
}

function updateVote(product, like, userId, res) {
  if (like === 1 || like === -1) return incrementVote(product, userId, like)
  return resetVote(product, userId, res)
}

function resetVote(product, userId, res) {
  const { usersLiked, usersDisliked } = product
  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have voted both ways")

  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    return Promise.reject("User seems to not have voted")

  if (usersLiked.includes(userId)) {
    --product.likes
    product.usersLiked = product.usersLiked.filter((id) => id !== userId)
  } else {
    --product.dislikes
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
  }

  return product
}

function incrementVote(product, userId, like) {
  const { usersLiked, usersDisliked } = product

  const votersArray = like === 1 ? usersLiked : usersDisliked
  if (votersArray.includes(userId)) return product
  votersArray.push(userId)

  like === 1 ? ++product.likes : ++product.dislikes
  return product
}

module.exports = { sendClientResponse, getSauce, getSauces, createSauce, getSauceById, deleteSauce, modifySauce, likeSauce }
