type GoogleProfile = {
  sub: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  email_verified?: boolean;
};

export function mapGoogleProfile(profile: GoogleProfile) {
  return {
    id: profile.sub,
    name: profile.name ?? null,
    email: profile.email?.toLowerCase() ?? null,
    image: profile.picture ?? null,
    emailVerified: profile.email_verified ? new Date() : null,
    role: "CUSTOMER" as const,
  };
}
