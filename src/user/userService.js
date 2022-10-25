const addGoogleUser = (User) => ({ id, email, firstName, lastName }) => {
    const user = new User({
        id, email, firstName, lastName, source: "google"
    })
    return user.save()
}

const getUsers = (User) => () => {
    return User.find({})
}

const getUserByEmail = (User) => async ({ email }) => {
    return await User.findOne({ email })
}

module.exports = (User) => {
    return {
        addGoogleUser: addGoogleUser(User),
        getUsers: getUsers(User),
        getUserByEmail: getUserByEmail(User)
    }
}