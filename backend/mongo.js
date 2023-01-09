const  mongoose  = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator")

const password = process.env.DB_PASSWORD
const username = process.env.DB_USER
const db = process.env.DB_NAME
const uri = `mongodb+srv://${username}:${password}@cluster0.kxysytv.mongodb.net/${db}?retryWrites=true&w=majority`;

console.log("mot de passe de Mono: ", process.env.DB_PASSWORD)
mongoose.set("strictQuery",true);

mongoose
.connect(uri)
.then(() =>  console.log("connected"))
.catch((err) => console.error ("error connected", err)) 

const userShema = new mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true}
})

userShema.plugin(uniqueValidator)

const User = mongoose.model("User", userShema)

module.exports = {mongoose, User}
