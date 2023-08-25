const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({
      message: 'Sauce enregistrée !'
    }))
    .catch(error => res.status(400).json({
      error
    }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Sauce mise à jour!' }); })
            .catch((error) => { res.status(400).json({ error }); });
        })
      })
      .catch((error) => { res.status(500).json({ error }); });

  } else {
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce mise à jour!' }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.likeManager = (req, res, next) => {
  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id

  if (like === 1) {
    Sauce.updateOne({ _id: sauceId }, {
        $push: { usersLiked: userId },
        $inc: { likes: +1 },
      })
      .then(() => res.status(200).json({
        message: 'Like added !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === -1) {
    Sauce.updateOne({ _id: sauceId }, {
          $push: { usersDisliked: userId },
          $inc: { dislikes: +1 },
        }
      )
      .then(() => {
        res.status(200).json({
          message: 'Dislike added !'
        })
      })
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === 0) {
    Sauce.findOne({
        _id: sauceId
      })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, {
              $pull: { usersLiked: userId },
              $inc: { likes: -1 },
            })
            .then(() => res.status(200).json({
              message: 'Like deleted !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, {
              $pull: { usersDisliked: userId },
              $inc: { dislikes: -1 },
            })
            .then(() => res.status(200).json({
              message: 'Dislike deleted !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
      })
      .catch((error) => res.status(404).json({
        error
      }))
  }
}