const mongoose =require("mongoose");

const UserComment=mongoose.Schema(
    {
    comment:{type:String,required:true},
    author_name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    Post_delete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    likes: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Comment'
        }
    ]
    }
);
module.exports = mongoose.model('Comment', UserComment);
