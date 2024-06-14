const Note = require("../models/note")
const User = require("../models/user")
const asyncHandler = require("express-async-handler")

const getAllNotes = asyncHandler(async(req, res) => {
    //fetch all notes
    const notes = await Note.find().lean()

    //check if notes exist
    
    if(!notes?.length) {
        return res.status(400).json({message: "No note found"})
    }

    //iterate through every note and add username to note
    const notesWithUser = await Promise.all(notes.map(async(note) => {
        const user = await User.findOne(note.user).lean().exec()
        return {
            ...note,
            username: user.username
        }
    }))

    res.json(notesWithUser)


})
const createNote = asyncHandler(async(req, res) => {
    const { user, title, text } = req.body
    if(!user || !title || !text) {
        return res.status(400).json({message: "All fields are required"})
    }
    // check for duplicate note
    const duplicate = await Note.findOne({title}).collation({locale: 'en', strength: 2 }).lean().exec()
    if(duplicate) {
        return res.status(400).json({message: "Note already exist"})
    }

    // create new note
    const newNote = await Note.create({user, title, text})

    if(newNote) {
        return res.status(201).json({message: "A new note created"})
    } else {
        return res.status(400).json({message: "Invalid note data received"})
    }

})

const updateNote = asyncHandler(async(req, res) => {
 
    const { id, user, title, text, completed } = req.body

    //confirm the data 
    if(!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({message: "All fields are required"})
    }
    // fetch the note to update
    const note = await Note.findById(id).exec()

    //check for duplicate note title
    const duplicate = await Note.findOne({title}).collation({locale: 'en', strength: 2 }).lean().exec()

    //allow update of original note
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({message: "Duplicate note title"})
    }

    //update note object
    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.status(200).json(updatedNote)


})

const deleteNote = asyncHandler(async(req, res) => {
    const { id } = req.body

    //check if the note id exists in the request body
    if(!id) {
        return res.status(400).json({message: "note id not found"})
    }

    //fetch the note to delete
    const note = await Note.findById(id).exec()

    //delete note
    const result = await note.deleteOne()

    //set and send delete success message
    const reply = `Note ${result.title} with id ${result._id} deleted`

    res.json(reply)
})

module.exports = { getAllNotes, createNote, updateNote, deleteNote }