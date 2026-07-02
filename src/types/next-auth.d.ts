import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/auth/authorization";

declare module "next-auth" {
  interface User {
    role: AppRole;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    emailVerified?: string | null;
  }
}
