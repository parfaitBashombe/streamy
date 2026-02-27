import { prisma } from "../config/db.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // user exists
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists) {
    return res.status(400).json({ error: "Email already used" });
  }

  // hash password
};

export { register };
