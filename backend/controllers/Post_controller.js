const asyncHandler = require("express-async-handler");
const Question = require("../models/Postmodels");
const User = require("../models/Usermodels");
const Comment = require("../models/commentmodels");

const createnewpost = asyncHandler(async (req, res) => {
    const { label, question, author_name, private} = req.body;
    const userId = req.user._id;
    if (!userId) {
        return res.status(404).json({ message: "User not found" });
    }
    const newPost = new Question({
        label,
        question,
        author_name,
        private,
        Post_delete: userId,
    });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
});

const updatepost = asyncHandler(async (req, res) => {
    const id = req.params.id.trim();  // Trim any extraneous whitespace or newline characters
    const { label, question, private } = req.body;
    const userId = req.user._id;

    const post = await Question.findById(id);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.Post_delete) !== String(userId)) {
        return res.status(403).json({ message: "You do not have permission to update this post" });
    }

    post.label = label || post.label;
    post.question = question || post.question;
    post.private = private !== undefined ? private : post.private;

    await post.save();
    res.json({ message: "Post updated successfully", post });
});

const likePost = asyncHandler(async (req, res) => {
    const postId = req.params.id.trim();
    const userId = req.user._id;

    const post = await Question.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(like => String(like.user_id) === String(userId));
    if (alreadyLiked) {
        post.likes = post.likes.filter(like => String(like.user_id) !== String(userId));
    } else {
        post.likes.push({ user_id: userId });
    }
    await post.save();
    res.json({ message: alreadyLiked ? "Like removed from post" : "Post liked", post });
});

const deletepost = asyncHandler(async (req, res) => {
    const id = req.params.id.trim();
    const userId = req.user._id;
    const post = await Question.findById(id);
    
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.Post_delete) !== String(userId)) {
        return res.status(403).json({ message: "You do not have permission to delete this post" });
    }

    // Recursive function to delete all nested comments
    const deleteCommentsRecursive = async (commentIds) => {
        for (const commentId of commentIds) {
            const comment = await Comment.findById(commentId);
            if (comment) {
                await deleteCommentsRecursive(comment.replies); // Assuming `replies` holds nested comments
                await comment.deleteOne();
            }
        }
    };

    // Delete all comments and their nested comments
    await deleteCommentsRecursive(post.comments);

    // Delete the post itself
    await post.deleteOne();
    res.json({ message: "Post and all associated comments and nested comments deleted successfully" });
});

const get_post = asyncHandler(async (req, res) => {
    const id = req.params.id.trim();
    const post = await Question.findById(id).populate('comments').populate('likes.user_id', 'username');
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
});

module.exports = { createnewpost, updatepost, deletepost, get_post,likePost };
