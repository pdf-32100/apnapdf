import dotenv from "dotenv";
dotenv.config();

const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  publicUrl: (process.env.PUBLIC_URL || "http://localhost:4000").replace(/\/$/, ""),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    get enabled() {
      return Boolean(this.keyId && this.keySecret);
    },
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: (process.env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/$/, ""),
    // Root folder inside the ImageKit media library.
    folder: (process.env.IMAGEKIT_FOLDER || "/printwala").replace(/\/$/, ""),
    get enabled() {
      return Boolean(this.publicKey && this.privateKey && this.urlEndpoint);
    },
  },
  // The first admin account, created by the seed script. No defaults on
  // purpose: an unset value must fail loudly, never create a known login.
  admin: {
    name: process.env.ADMIN_NAME || "Admin",
    email: process.env.ADMIN_EMAIL || "",
    password: process.env.ADMIN_PASSWORD || "",
  },
};

export default env;
