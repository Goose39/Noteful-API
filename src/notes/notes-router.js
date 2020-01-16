const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const bodyParser = express.json()

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  modified: note.modified,
  folderid: note.folderid
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeNote))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { id, note_name, content, folderid } = req.body
    const newNote = { id, note_name, content, folderid }

    for (const field of ['note_name', 'content', 'folderid']) {
      if (!newNote[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        logger.info(`New note created.`)
        res
          .status(201)
          .json(serializeNote(note))
      })
      .catch(next)
  })


  notesRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params
    NotesService.getNoteById(req.app.get('db'), id)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `Note Not Found` }
          })
        }

        res.note = note
        next()
      })
      .catch(next)

  })

  .get((req, res) => {
    res.json(serializeNote(res.note))
  })

  .delete((req, res, next) => {
    const { id } = req.params
    NotesService.deleteNote(
      req.app.get('db'),
      id
    )
      .then(numRowsAffected => {
        logger.info(`Note with id ${id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const { id, note_name, content, folderid } = req.body
    const noteToUpdate = { id, note_name, content, folderid }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title', 'url', 'description' or 'rating'`
        }
      })
    }

    NotesService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter
