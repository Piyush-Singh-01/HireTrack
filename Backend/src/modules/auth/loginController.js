import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";

const loginController = async (req, res) => {
  try {
    const { businessEmail, password } = req.body;

    if (!businessEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    /* ================= USER LOGIN ================= */

    const user = await User.findOne({ businessEmail });

    if (user) {
      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: "Please verify your email",
        });
      }

      if (!user.password) {
        return res.status(500).json({
          success: false,
          message: "User password not set",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          email: user.businessEmail,
          role: user.role,
          companyCode: user.companyCode,
        },
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      const refreshToken = jwt.sign(
        {
          id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ SET COOKIE
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Backward compatibility for existing middleware
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "User login successful",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.userName,
          email: user.businessEmail,
          role: user.role,
          companyCode: user.companyCode,
        },
      });
    }

    /* ================= USER & ROLE LOGIN ================= */

    const userandrole = await UserAndRole.findOne({
      Email: businessEmail,
    });

    if (!userandrole) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!userandrole.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify email",
      });
    }

    if (userandrole.accountStatus !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account inactive. Contact admin",
      });
    }

    if (!userandrole.password) {
      return res.status(500).json({
        success: false,
        message: "Password not set",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      userandrole.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

      const accessToken = jwt.sign(
        {
          id: userandrole._id,
          email: userandrole.Email,
          role: userandrole.Role,
          companyCode: userandrole.companyCode,
        },
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      const refreshToken = jwt.sign(
        {
          id: userandrole._id,
        },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ SET COOKIE
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
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
      message: "User login successful",
      accessToken,
      refreshToken,
      user: {
        id: userandrole._id,
        name: userandrole.Name,
        email: userandrole.Email,
        role: userandrole.Role,
        Position: userandrole.Position,
        companyCode: userandrole.companyCode,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default loginController;
