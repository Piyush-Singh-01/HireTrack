import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Find user (could be SuperAdmin or Employee)
    let user = await User.findById(decoded.id);
    let isUserAndRole = false;

    if (!user) {
      user = await UserAndRole.findById(decoded.id);
      isUserAndRole = true;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check status if Employee
    if (isUserAndRole && user.accountStatus !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account inactive",
      });
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: isUserAndRole ? user.Email : user.businessEmail,
        role: isUserAndRole ? user.Role : user.role,
        companyCode: user.companyCode,
      },
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const newRefreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET COOKIES
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Backward compatibility
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        userName: isUserAndRole ? user.Name : user.userName,
        name: isUserAndRole ? user.Name : user.userName,
        businessEmail: isUserAndRole ? user.Email : user.businessEmail,
        email: isUserAndRole ? user.Email : user.businessEmail,
        role: isUserAndRole ? user.Role : user.role,
        companyCode: user.companyCode,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

export default refreshTokenController;