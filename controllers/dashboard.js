const dashboardController = {};

dashboardController.renderDashboard = async function (req, res, next) {
  try {
    const user = req.user;

    res.render("dashboard/dashboard", { user });
  } catch (err) {
    console.error("Error rendering dashboard:", err);
    next(err);
  }
};

module.exports = dashboardController;