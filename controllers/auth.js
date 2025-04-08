const mongoUser = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const bcrypt = require("bcryptjs");
const passport = require("passport");

let authController = {};

authController.submittedLogin = function (req, res, next) {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  mongoUser
    .findOne({ email: emailInput })
    .then(function (user) {
      bcrypt.compare(passwordInput, user.password).then(function (result) {
        if (result === true) {
          const authToken = jwt.sign({ email: user.email }, config.secret, {
            expiresIn: 86400000,
          });
          res.cookie("auth-token", authToken, { maxAge: 86400000 });
          res.redirect("/dashboard");
        } else {
          res.redirect("/auth/login");
        }
      });
    })
    .catch(function (err) {
      next(err);
    });
};

authController.login = function (req, res, next) {
  res.render("login/index");
};

authController.logout = function (req, res, next) {
  res.clearCookie("auth-token");
  res.redirect("/");
};

authController.createLogin = function (req, res, next) {
  res.render("login/createUser");
};

authController.createLoginSubmitted = function (req, res, next) {
  console.log(req.body);

  const hashedPassword = bcrypt.hashSync(req.body.password, 8);
  req.body.password = hashedPassword;

  mongoUser
    .create(req.body)
    .then(function () {
      res.redirect("/auth/login");
    })
    .catch(function (err) {
      next(err);
    });
};

authController.verifyLoginUser = function (req, res, next) {
  const authToken = req.cookies["auth-token"];
  if (authToken) {
    jwt.verify(authToken, config.secret, function (err, decoded) {
      if (err) {
        return res.redirect("/auth/login");
      }

      mongoUser
        .findOne({ email: decoded.email })
        .then(function (user) {
          if (user && user.email) {
            return res.redirect("/dashboard");
          }
          req.user = user;
          next();
        })
        .catch(function (err) {
          next(err);
        });
    });
  } else {
    next();
  }
};

authController.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});



// Função para atualizar o email do usuário com base no Facebook ID
authController.updateUserEmail = async (facebookId, email, name) => {
    try {
        console.log('Tentando atualizar o usuário com Facebook ID:', facebookId);
        console.log('Novo e-mail:', email);

        // Verifica se o usuário com esse Facebook ID existe
        let user = await mongoUser.findOne({ facebookId });
        if (!user) {
            console.log('Usuário não encontrado com o Facebook ID. Criando novo usuário...');
            // Caso o usuário não exista, cria um novo usuário
            user = await mongoUser.create({ facebookId, email, name });  // Inclua o name aqui
        } else {
            // Caso o usuário exista, atualize o email
            user.email = email;
            await user.save();
            console.log('Usuário atualizado com sucesso:', user);
        }

        return user;
    } catch (err) {
        console.log('Erro ao atualizar ou criar o usuário no banco de dados:', err);
        return null;
    }
};




authController.findUserByEmail = function(email) {
    return mongoUser.findOne({ email: email });
};
          
module.exports = authController;

authController.googleCallback = passport.authenticate(
  "google",
  { failureRedirect: "/auth/login" },
  (req, res) => {
    res.redirect("/");
  }
);

authController.findUserByEmail = function (email) {
  return mongoUser.findOne({ email: email });
};

module.exports = authController;
