const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

//Load input validation
const validatePostInput = require("../../validation/post");

//@route    GET api/post/test
//@desc     Test post route
//@access   Public
router.get("/test", (req, res) => res.json({ msg: " Post Works!" }));

//@route    GET api/post
//@desc     Get posts
//@access   Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

//@route    GET api/post/:id
//@desc     Get post by id
//@access   Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => {
      res.status(404).json({ nopostfound: "No post found with that ID" });
    });
});

//@route    POST api/post
//@desc     Create post
//@access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check Validation
    if (!isValid) {
      //if any errors , send 400 with error object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

//@route    DELETE api/post/:id
//@desc     Delete post
//@access   Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            //Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res.status(401).json({ authorize: "User not autorize" });
            }

            //Delete
            post.remove().then(() => {
              return res.status(200).json({ success: true });
            });
          })
          .catch(err => {
            return res.status(404).json({ postnotfound: "No post found" });
          });
      })
      .catch(err => {
        return res.status(404).json({ usernotfound: "No user found" });
      });
  }
);

//@route    POST api/post/like/:id
//@desc     Like post
//@access   Private

router.delete(
  "like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {})
          .catch(err => {
            return res.status(404).json({ postnotfound: "No post found" });
          });
      })
      .catch(err => {
        return res.status(404).json({ usernotfound: "No user found" });
      });
  }
);

module.exports = router;
