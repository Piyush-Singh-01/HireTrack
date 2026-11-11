const normalizeRole = (role) => {
  if (!role) return "";
  return role.toString().trim().toLowerCase();
};

const checkRole = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    const role = normalizeRole(req.user?.Role);

    if (!normalizedAllowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    next();
  };
};

export const superAdminOnly = checkRole("SuperAdmin");
export const adminOnly = checkRole("SuperAdmin", "Admin");
export const allAccess = checkRole("SuperAdmin", "Admin", "HR", "Interviewer");

export default checkRole;

