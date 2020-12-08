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

    //todo: use getallforuser?

    //url, id, media type,  post text
    let params = {
        userId: request.currentUser.id,
        text: request.body.text,
        media:{
            type: request.body.media.type,
            url: request.body.media.url,
        },
    };

    PostModel.create(params, () => {
        response.status(201).json()
    });

    const noPost = {
        code: 'invalid_credentials',
        message: 'Post with specified info cannot be found'
    }
    const noInput = {
        code: 'none_or_invalid_input',
        message: 'Please provide required info for post creation'
    };

    //check if input is valid
    if ((params.media.type && !params.media.url || !params.media.typ && params.media.url) || !params.text) {
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
    PostModel.like(request.currentUser.id, request.body.id, (post) =>{
        response.status(200).json(post)
    })
});

router.delete('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to unlike a post
    PostModel.unlike(request.currentUser.id, request.body.id, (post)=>{
        response.status(200).json(post)
    })
});

module.exports = router;
