const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    label: { type: String, required: true },
    question: { type: String, required: true },
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
    private: { type: Boolean, default: false },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Comment',
        }
    ]
});

// questionSchema.pre('save', function(next) {
//     if (!this.Post_delete) {
//         this.Post_delete = this._id;
//     }
//     next();
// });

module.exports = mongoose.model('Question', questionSchema);
