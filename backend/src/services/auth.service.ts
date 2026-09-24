import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

function toPublicUser(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw ApiError.conflict("Un compte existe déjà avec cet email");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "CLIENT",
      },
    });

    const token = signToken({ sub: user.id, role: user.role });
    return { user: toPublicUser(user), token };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    // Message volontairement générique : ne pas révéler si c'est l'email ou le mot de passe qui est faux
    if (!user) {
      throw ApiError.unauthorized("Email ou mot de passe incorrect");
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("Email ou mot de passe incorrect");
    }

    const token = signToken({ sub: user.id, role: user.role });
    return { user: toPublicUser(user), token };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("Utilisateur introuvable");
    return toPublicUser(user);
  },
};
