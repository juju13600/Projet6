const {app, express} = require("./server")
const {saucesRouter} = require ("./routers/sauces.router")
const {authRouter} = require ("./routers/auth.router")
const bodyParser = require ("body-parser")
const port = 3000
const path = require ("path")

//Connection to database
require ("./mongo")



//Middleware
app.use(bodyParser.json())
app.use("/api/sauces", saucesRouter)
app.use("/api/auth", authRouter)


app.get("/", (req,res)=> res.send("coucou"))

//Listen
app.use("/images", express.static(path.join(__dirname,"images")))
app.listen (port, ()=> console.log("listening on port " + port))

