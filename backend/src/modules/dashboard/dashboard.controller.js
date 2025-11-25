const { getDashboardSummary } = require('./dashboard.service');

async function getSummary(req, res, next) {
  try {
    const summary = await getDashboardSummary(req.user.user_id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
