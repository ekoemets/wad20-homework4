const { text } = require('express');
const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const PostModel = require('../models/PostModel');


router.get('/', authorize, (request, response) => {

    // Endpoint to get posts of people that currently logged in user follows or their own posts

    PostModel.getAllForUser(request.currentUser.id, (postIds) => {

        if (postIds.length) {
            PostModel.getByIds(postIds, request.currentUser.id, (posts) => {
                response.status(201).json(posts)
            });
            return;
        }
        response.json([])

    })

});

router.post('/', authorize,  (request, response) => {

    // Endpoint to create a new post

    let params = {
        userId: request.currentUser.id,
        text: request.body.text,
        media:{
            type: request.body.media.type,
            url: request.body.media.url,
        },
    };

    const noInput = {
        code: 'none_or_invalid_input',
        message: 'Please provide required info for post creation'
    };

    //check if input is valid
    if ((params.media.type && !params.media.url || 
        !params.media.type && params.media.url) || !params.text) {
        response.status(400).json(noInput);
        return;
    }

    PostModel.create(params, () =>{
        response.status(200).json()
        return;
    });

});


router.put('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to like a post
    //if post exists

    const noPost = {
        code: 'none_or_invalid_input',
        message: 'Post with specified info cannot be found'
    };

    const alreadyLiked = {
        code: 'already_liked',
        message: 'Post was already liked'
    }

    const postId = request.params.postId;
    const userId = request.currentUser.id
    
    // We don't want to add a record if a post does not exist
    PostModel.getByIds([postId], null, (posts) => {
        if (posts.length == 0) {
            response.status(400).json(noPost);
        } 
        else {
            // We also don't want to add a record if the post is liked already
            PostModel.getLikesByUserIdAndPostId(userId, postId, (likes) => {
                if (likes.length != 0) {
                    response.status(400).json(alreadyLiked);
                } 
                else {
                    PostModel.like(userId, postId, () => {
                        response.status(200).json()
                    })
                }
            });
        }
    });

});


router.delete('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to unlike a post
    //if post exists

    const notLiked = {
        code: 'not_liked',
        message: 'Post with specified id was not liked'
    }

    const userId = request.currentUser.id;
    const postId = request.params.postId;

    // We don't want to unlike a post that user has not liked
    PostModel.getLikesByUserIdAndPostId(userId, postId, (likes) => {
        if (likes.length == 0) {
            response.status(400).json(notLiked)
        } else {
            PostModel.unlike(userId, postId, () => {
                response.status(200).json()
            })
        }
    })
});

module.exports = router;
