const mongoUser = require("../models/user");
const mongoRestaurant = require("../models/restaurant"); 

const profile = {};

profile.showProfile = async function (req, res, next) {
  try {
    if (!req.user) return res.json("/auth/login"); 

    let totalRestaurants = 0;
    let approvedRestaurants = 0;
    let notApprovedRestaurants = 0;

    if (req.user.role === "Manager") {
      const restaurants = await mongoRestaurant.find({ managerId: req.user._id });

      totalRestaurants = restaurants.length;
      approvedRestaurants = restaurants.filter(r => r.isApproved).length;
      notApprovedRestaurants = totalRestaurants - approvedRestaurants;
    }

    res.json({
      user: req.user,
      totalRestaurants,
      approvedRestaurants,
      notApprovedRestaurants,
    });
  } catch (err) {
    console.error("Error fetching manager's restaurants:", err); 
    next(err);
  }
};

profile.editProfile = function (req, res, next) {
  if (!req.user) return res.json("/auth/login"); 

  res.json({ user: req.user }); 
};

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
