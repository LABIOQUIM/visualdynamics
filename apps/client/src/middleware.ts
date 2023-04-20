export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/my-dynamics", "/dynamic/:path*", "/api/downloads/:path*"]
};
