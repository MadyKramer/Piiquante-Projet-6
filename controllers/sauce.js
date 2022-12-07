const Sauce = require("../models/sauce");
const fs = require("fs");


exports.createSauce = (req, res, next) => {
  const newSauce = typeof req.body.sauce === "string"? JSON.parse(req.body.sauce):req.body.sauce;
  delete newSauce._id;
  const sauce = new Sauce({
    ...newSauce,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce Enregistrée! " }))
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.editSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      if (!sauce) {
        return res.status(404).json({ error });
      }
      if (sauce.userId != req.auth.userId){
        return res.status(401).json({ error })
      }
      if (req.file){
        fs.unlinkSync(`images/${filename}`)
      }
      
      //Renvoie un boolean pour la modification de l'image, si true, on renvoie l'image et le body de la requête, si false, on renvoie le body de la requête
      const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          }
        : { ...req.body };

      Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      return res.status(404).json({
        error: new Error("Sauce non trouvée!"),
      });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//Like & Dislike

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    switch (req.body.like) {
      case 1:
        //Si l'utilisateur n'est pas déjà dans le tableau, on incrémente et on push
        if (!sauce.usersLiked.includes(req.body.userId)) {
          sauce.likes++;
          sauce.usersLiked.push(req.body.userId);
        }
        break;
      case 0: //Besoin de retirer son like pour pouvoir dislike & vice-versa
        if (sauce.usersLiked.includes(req.body.userId)) {
          sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId, 1));
          sauce.likes--;
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          sauce.dislikes--;
          sauce.usersDisliked.splice(
            sauce.usersLiked.indexOf(req.body.userId, 1)
          );
        }
        break;
      case -1:
        //Si l'utilisateur n'est pas déjà dans le tableau, on incrémente et on push
        if (!sauce.usersDisliked.includes(req.body.userId)) {
          sauce.dislikes++;
          sauce.usersDisliked.push(req.body.userId);
        }
        break;
      default:
        break;
    }
    sauce
      .save()
      .then(() =>
        res
          .status(200)
          .json({ message: "Votre avis a bien été pris en compte!" })
      )
      .catch((error) => res.status(400).json({ error }));
  });
};
