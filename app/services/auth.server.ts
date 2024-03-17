import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";
import invariant from "tiny-invariant";
import bcrypt from "bcryptjs";

import prisma from "~/lib/prisma";
import { sessionStorage } from "./session.server";

type SessionUser = {
  id: string;
  email: string;
};

export const authenticator = new Authenticator<SessionUser>(sessionStorage);

// ===== STRATEGIES =======
const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email");
  const password = form.get("password");

  invariant(typeof email === "string", "email must be a string");
  invariant(email.length > 0, "email must not be empty");

  invariant(typeof password === "string", "password must be a string");
  invariant(password.length > 0, "password must be not be empty");

  const user = await loginWithEmailAndPassword(email.toLowerCase(), password);

  return user;
});

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  },
  async ({ profile }) => {
    const email = profile.emails[0].value;
    const providerId = profile.id;
    const providerName = "google";

    // Check connection
    const connection = await prisma.connection.findUnique({
      where: {
        providerName_providerId: {
          providerId,
          providerName,
        },
      },
      include: { user: true },
    });

    // Return user from connection if connection exists
    if (connection) {
      invariant(
        connection.user.isActive,
        "Your account is inactive. Please contact admin!"
      );
      return connection.user;
    }

    // Check if user exist (user signup with email and password)
    const foundUser = await prisma.user.findUnique({ where: { email } });

    if (foundUser) {
      invariant(
        foundUser.isActive,
        "Your account is inactive. Please contact admin!"
      );
      // Create connection with google
      await prisma.connection.create({
        data: { providerId, providerName, userId: foundUser.id },
      });
      return foundUser;
    }

    invariant(false, "User not registered");
  }
);

authenticator.use(formStrategy);
authenticator.use(googleStrategy);

// ===== FUNCTIONS =======
async function loginWithEmailAndPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  });

  invariant(!!user, "User not found");

  invariant(
    !!user.password,
    "Invalid credentials. Your password is incorrect or your password has not been set"
  );

  const isValidPassword = await verifyPassword(password, user.password.hash);

  invariant(
    isValidPassword,
    "Invalid credentials. Your password is incorrect or your password has not been set"
  );

  invariant(user.isActive, "Your account is inactive. Please contact admin!");

  return user;
}

export async function setPassword(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { password: true },
  });

  if (user?.password) {
    invariant(
      false,
      "Your password already set. If you want to change password, use change password"
    );
  }

  const hash = await hashPassword(password);

  await prisma.password.create({ data: { userId, hash } });
}

export async function changePassword(id: string, newHashedPassword: string) {
  return await prisma.user.update({
    where: { id },
    data: { password: { update: { hash: newHashedPassword } } },
  });
}

export async function createUser({
  email,
  name,
  organizationId,
  password,
  memberStatus,
}: {
  name: string;
  email: string;
  password: string;
  organizationId: string;
  memberStatus: "FULLTIME" | "INTERN" | "OUTSOURCED";
}) {
  const foundUser = await prisma.user.findUnique({
    where: { email },
  });

  if (foundUser) {
    invariant(false, `User with email "${email}" already registered.`);
  }

  let hash = "";

  if (password) {
    hash = await hashPassword(password);
  }

  const user = prisma.user.create({
    data: {
      email,
      name,
      organizationUsers: { create: { organizationId, memberStatus } },
      password: hash ? { create: { hash } } : undefined,
    },
  });

  return user;
}

export async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}

export async function hasSuperAdmin() {
  const superAdminCount = await prisma.user.count({
    where: { isSuperAdmin: true },
  });
  return !!superAdminCount;
}

export async function createSuperAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const hash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name: "Super Admin",
      isSuperAdmin: true,
      password: { create: { hash } },
    },
  });

  return user;
}
