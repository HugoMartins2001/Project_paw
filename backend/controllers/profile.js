const mongoUser = require("../models/user");
const mongoRestaurant = require("../models/restaurant"); 

const profile = {};

// jsonizar a página de perfil
profile.showProfile = async function (req, res, next) {
  try {
    if (!req.user) return res.json("/auth/login"); 

    let totalRestaurants = 0;
    let approvedRestaurants = 0;
    let notApprovedRestaurants = 0;

    // Se o usuário for um gerente, buscar os restaurantes associados
    if (req.user.role === "Manager") {
      const restaurants = await mongoRestaurant.find({ managerId: req.user._id });

      // Calcula os números
      totalRestaurants = restaurants.length;
      approvedRestaurants = restaurants.filter(r => r.isApproved).length;
      notApprovedRestaurants = totalRestaurants - approvedRestaurants;
    }

    // jsoniza a página de perfil com os dados do usuário e os números dos restaurantes
    res.json({
      user: req.user,
      totalRestaurants, // Passa o total de restaurantes
      approvedRestaurants, // Passa os restaurantes aprovados
      notApprovedRestaurants, // Passa os restaurantes não aprovados
    });
  } catch (err) {
    console.error("Error fetching manager's restaurants:", err); // Loga erros no console
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
};

// jsonizar a página de edição de perfil
profile.editProfile = function (req, res, next) {
  if (!req.user) return res.json("/auth/login"); // Redireciona para a página de login se o usuário não estiver autenticado

  res.json({ user: req.user }); // jsoniza a página de edição de perfil com os dados do usuário
};

// Atualizar o perfil do usuário
profile.updateProfile = function (req, res, next) {
  try {
    const userId = req.user._id;

    const {
      name,
      email,
      clienteTelemovel,
      clienteNif,
      address,
      managerTelemovel,
    } = req.body;

    const updatedUserData = {
      name,
      email,
      clienteTelemovel,
      clienteNif,
      address,
      managerTelemovel,
    };

    if (req.file) {
      updatedUserData.profilePic = req.file.filename; 
    }

    mongoUser.findByIdAndUpdate(userId, updatedUserData, { new: true, runValidators: true }) 
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).json("User not found."); 
        }
        res.json({ message: "Profile updated successfully." }); 
      })
      .catch((err) => {
        console.error("Error updating profile:", err); 
        next(err);
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    next(err);
  }
};

module.exports = profile;
