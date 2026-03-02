import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getOrCreateWorkspace } from "@/lib/workspaceService"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || (!user._id && !(user as any).id)) {
      return NextResponse.json({ success: false, message: "Invalid user token" }, { status: 401 })
    }

    const uid = user._id || (user as any).id;
    const workspaceData = await getOrCreateWorkspace(uid, user.name)

    if (!workspaceData) {
      return NextResponse.json({ success: false, message: "Failed to get workspace" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      workspace: workspaceData.workspace,
      members: workspaceData.members,
      currentUser: user,
    })
  } catch (error) {
    console.error("Workspace API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
