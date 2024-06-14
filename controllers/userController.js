const User = require("../models/user");
const Note = require("../models/note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res, next) => {
   
    const users = await User.find().select("-password").lean()
    if(!users?.length) {
        return res.status(400).json({message: "No users found"})
    }
    res.json(users)
     
});

const createNewUser = asyncHandler(async (req, res) => {
    
        const { username, password, roles } = req.body

        //confirm data
        if(!username || !password || !Array.isArray(roles) || !roles.length){
           return res.status(400).json({message: "All fields are required"})
        }
    
        //check duplicate user/username
        const duplicateUsername = await User.findOne({username}).collation({ locale: 'en', strength: 2}).lean().exec()
        if(duplicateUsername) {
          return  res.status(409).json({message: "Duplicate username"})
        }
    
        //hash the password
        const hashedPwd = await bcrypt.hash(password, 10)
    
        const userObject = {username: username, password: hashedPwd, roles}
    
        //create and store new user
        const newUser = await User.create(userObject)
    
        //check if new user is created and return sucess message or failure message when it fails
        if(newUser) {
            res.status(201).json({message: `new user, ${newUser} created.`})
        } else {
            res.status(400).json({message: "invalid user credentials."})
        }
              
    
});

const updateUser = asyncHandler(async (req, res,) => {
    
        const { id, username, roles, active, password } = req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles), roles.length == 0, typeof active !== 'boolean'){
        return res.status(400).json({message: "all fields required."})
    }

    //fetch user by id - the user to update
    const user = await User.findById(id).exec();

    //check duplicate user - by username
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2 }).lean().exec()

    //allow update of original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({message: "duplicate username"})
    }
    //update the user object
    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        //hash password
        user.password = await bcrypt.hash(password, 10)
    }

    //save the updated user object
    const updatedUser = user.save()

    //send the response
    res.json({message: `${updatedUser.username} updated`})
});

const deleteUser = asyncHandler(async (req, res) => {

        //get the user id 
        const { id } = req.body

        //check if the user id exist
        if(!id) {
            return res.status(400).json({message: "User id is required"})
        }
    
        const note = await Note.findOne({user: id}).lean().exec()
        if(note) {
            return res.status(400).json({message: "user has assigned notes"})
        }
    
        //fetch the user using the id - user to be deleted
        const user = await User.findById(id).exec()
    
        //check if a user by that id doesn't exists
        if(!user) {
            return res.status(400).json({message: "User does not exist"})
        }
    
        //delete the user
        const result = await user.deleteOne()
    
        //send reply
        const reply = `Username ${result.username} with ID ${result._id} deleted`
    
        //send response
        res.json(reply)
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
