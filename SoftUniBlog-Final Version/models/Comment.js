const mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    content: { type: String, require: true },
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    about: {type:  mongoose.Schema.Types.ObjectId, required: true, ref: 'Article'},
    date: { type: Date, default: Date.now() }
});

commentSchema.method({
    prepareInsert: function () {
        let Article = require('mongoose').model('Article')
        Article.findById(this.about).then(article => {
            if (article) {
                article.comments.push(this.id)
                article.save()
            }
        })
    },
    prepareDelete: function () {
        let Article = require('mongoose').model('Article')
        Article.findById(this.about).then(article => {
            if(article){
                article.comments.remove(this.id)
                article.save()
            }
        })
    }
})
commentSchema.set('versionKey', false);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;