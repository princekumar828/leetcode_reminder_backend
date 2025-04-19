const express = require('express')
const app = express()
require('./telegram/telegramBot')
const cors = require('cors')


const dotenv = require('dotenv')
dotenv.config()

const port = process.env._PORT || 3000

//Middleware

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));





//Conection
const connectdb= require('./connection')
connectdb()




const userrouter = require('./routes/users')
//Routes
app.use('/users', userrouter)




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})