import { auth } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/api/drive/folders", "/api/drive/photos"],
}

export default auth
