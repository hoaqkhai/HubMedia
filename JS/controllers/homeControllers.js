module.exports = {
    getHomepage: (req, res) => {
        res.render('homepage.ejs', {
            user: req.session.user || null
        });
    }
};
