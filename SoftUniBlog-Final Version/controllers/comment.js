const Article=require('mongoose').model('Article');

const Comment = require('mongoose').model('Comment');
module.exports= {
    commentPost: (req, res) => {
        let commentArgs = req.body;
        let id = commentArgs.about; //article.id (details.hbs name="about")
        Article.findById(id).populate('comments').then(article => {
            let Comment = require('mongoose').model('Comment');
            let commentArgs = req.body;
            Comment.create(commentArgs).then(comment => {
                article.comments.push(comment.id);
                article.save();
                comment.prepareInsert();
                res.redirect(` /article/details/${id}`);
            })
        })
    }
};