const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');

exports.getPost = (req, res) => {
    const postId = req.params.postId;
    const post = Post.findById(postId)
                     .then(post => {
                        res.status(200).json({
                           message: "Post found successfully!",
                           post: post
                        });
                     })
                     .catch(err => console.log(err));
};

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const pageSize = 2;
    let totalPages;

    Post.find()
        .countDocuments()
        .then(pages => {
            totalPages = pages;
            return Post.find().skip((currentPage - 1) * pageSize).limit(pageSize);
        })
        .then(posts => {
            res.status(200).json({
                posts: posts,
                totalItems: totalPages
            });
        })
        .catch(err => console.log(err));
};

exports.createPost = (req, res, next) => {
    const imageUrl = req.file.path.replace("\\" ,"/");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    let creator;
    post.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Post created successfully!",
                post: post,
                creator: { id: creator._id, name: creator.name }
            });
        })
        .catch(err => console.error(err));
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if(req.file) {
        imageUrl = req.file.path;
    }
    if(!imageUrl) {
        const error = new Error("Image not picked!");
        error.status = 422;
        throw error;
    }

    Post.findById(postId).then(post => { 
        if(!post) {
            const err = new Error("Could not find post!");
            err.status = 404;
            throw err;
        }
        if(imageUrl !== post.imageUrl) {
            clearImage(imageUrl);
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then(result => {
        res.status(200).json({
            message: "Post updated successfully!",
            post: result
        });
    })
    .catch(err => console.log(err));
}

const clearImage = filePath => {
    filePath = path.join(__dirname + '..' + filePath);
    fs.unlink(filePath, err => console.log(err));
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => { 
        if(!post) {
            const err = new Error("Could not find post!");
            err.status = 404;
            throw err;
        }
        if(post.imageUrl) {
            clearImage(post.imageUrl);
        }
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        res.status(200).json({message: "Deleted post successfully!"});
    })
    .catch(err => console.log(err));
}