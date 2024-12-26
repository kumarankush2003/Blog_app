const asyncHandler = require( "express-async-handler" );
const Question = require( "../models/Postmodels" );
const User = require( "../models/Usermodels" );
const Comment = require( "../models/commentmodels" );

const addComment = asyncHandler( async ( req, res ) =>
{
    const postid = req.params.id.trim();
    const { comment } = req.body;
    const userId = req.user._id;

    const newComment = new Comment( {
        comment,
        author_name: req.user.Name,
        Post_delete: userId,
    } );

    const savedComment = await newComment.save();

    await Question.findByIdAndUpdate(
        postid,
        { $push: { comments: savedComment._id } },
        { new: true }
    );

    res.status( 201 ).json( { message: "Comment added successfully", comment: savedComment } );
} );

const nestedComment = asyncHandler( async ( req, res ) =>
{
    const parent_id = req.params.id.trim();
    const { comment } = req.body;
    const userId = req.user._id;
    const parentComment = await Comment.findById( parent_id );
    if ( !parentComment )
    {
        res.status( 404 ).json( { message: "Comment not found" } );
    }
    const newComment = new Comment( {
        comment,
        author_name: req.user.Name,
        Post_delete: userId,
        parent_id: parent_id
    } );
    const savedComment = await newComment.save();
    await Comment.findByIdAndUpdate(
        parent_id,
        { $push: { comments: savedComment._id } },
        { new: true }
    );
    res.status( 201 ).json( { message: "Comment added successfully", comment: savedComment } );
} );

const like = asyncHandler( async ( req, res ) =>
{
    const commentId = req.params.id.trim();
    const userId = req.user._id;

    const comment = await Comment.findById( commentId );
    if ( !comment )
    {
        return res.status( 404 ).json( { message: "Comment not found" } );
    }

    const alreadyLiked = comment.likes.some( like => String( like.user_id ) === String( userId ) );
    if ( alreadyLiked )
    {
        comment.likes = comment.likes.filter( like => String( like.user_id ) !== String( userId ) );
    } else
    {
        comment.likes.push( { user_id: userId } );
    }

    await comment.save();
    res.json( { message: alreadyLiked ? "Like removed" : "Liked", comment } );
} );

const deleteComment = asyncHandler( async ( req, res ) =>
{
    const { commentId } = req.params.commentId.trim();
    const userId = req.user._id;

    const comment = await Comment.findById( commentId );
    if ( !comment )
    {
        return res.status( 404 ).json( { message: "Comment not found" } );
    }

    if ( String( comment.Post_delete ) !== String( userId ) )
    {
        return res.status( 403 ).json( { message: "You do not have permission to delete this comment" } );
    }

    await Comment.findByIdAndRemove( commentId );

    await Question.findOneAndUpdate(
        { comments: commentId },
        { $pull: { comments: commentId } },
        { new: true }
    );

    res.json( { message: "Comment deleted successfully" } );
} );

const editComment = asyncHandler( async ( req, res ) =>
{
    const { commentId } = req.params.commentId.trim();
    const { comment } = req.body;
    const userId = req.user._id;

    const existingComment = await Comment.findById( commentId );
    if ( !existingComment )
    {
        return res.status( 404 ).json( { message: "Comment not found" } );
    }

    if ( String( existingComment.Post_delete ) !== String( userId ) )
    {
        return res.status( 403 ).json( { message: "You do not have permission to edit this comment" } );
    }

    existingComment.comment = comment || existingComment.comment;
    await existingComment.save();

    res.json( { message: "Comment updated successfully", comment: existingComment } );
} );

const getComment = asyncHandler( async ( req, res ) =>
{
    const { commentId } = req.params.commentId.trim();

    const comment = await Comment.findById( commentId ).populate( 'likes.user_id', 'username' ).populate( 'comments' );
    if ( !comment )
    {
        return res.status( 404 ).json( { message: "Comment not found" } );
    }

    res.json( comment );
} );

module.exports = { addComment, like, deleteComment, editComment, getComment,nestedComment };
