require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')
const validateBearerToken = require('./validate-bearer-token')
const errorHandler = require('./error-handler')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(validateBearerToken)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use('/api/notes', notesRouter);
app.use('/api/folders', foldersRouter)

app.use(errorHandler)

module.exports = app