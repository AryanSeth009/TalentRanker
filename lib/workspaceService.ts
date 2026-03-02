import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
})

export interface Workspace {
  id: string
  name: string
  owner_id: string
  plan: string
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: 'admin' | 'member' | 'viewer'
}

export async function getUserWorkspace(userId: string): Promise<Workspace | null> {
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .limit(1)

  if (ownedWorkspaces && ownedWorkspaces.length > 0) {
    return ownedWorkspaces[0] as Workspace
  }

  const { data: memberWorkspaces, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(*)')
    .eq('user_id', userId)
    .limit(1)

  if (memberWorkspaces && memberWorkspaces.length > 0 && memberWorkspaces[0].workspaces) {
    const wp = memberWorkspaces[0].workspaces
    return (Array.isArray(wp) ? wp[0] : wp) as Workspace
  }

  return null
}

export async function createDefaultWorkspace(userId: string, userName: string): Promise<Workspace | null> {
  const workspaceName = `${userName ? userName.trim().split(' ')[0] : 'My'}'s Workspace`
  
  const { data: newWorkspace, error: insertError } = await supabase
    .from('workspaces')
    .insert([
      { name: workspaceName, owner_id: userId, plan: 'Pro Plan' }
    ])
    .select()
    .single()

  if (insertError || !newWorkspace) {
    console.error("Failed to create default workspace", insertError)
    return null
  }

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert([
      { workspace_id: newWorkspace.id, user_id: userId, role: 'admin' }
    ])

  if (memberError) {
    console.error("Failed to add owner as workspace member", memberError)
  }

  return newWorkspace as Workspace
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)

  if (error || !members) {
    console.error("Failed to get workspace members", error)
    return []
  }

  return members as WorkspaceMember[]
}

export async function getOrCreateWorkspace(userId: string, userName: string): Promise<{ workspace: Workspace, members: WorkspaceMember[] } | null> {
  let workspace = await getUserWorkspace(userId)
  
  if (!workspace) {
    workspace = await createDefaultWorkspace(userId, userName)
  }

  if (!workspace) return null

  const members = await getWorkspaceMembers(workspace.id)

  return { workspace, members }
}
