import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log("Testing workspaces table...")
  const { data, error } = await supabase.from('workspaces').select('*').limit(1)
  console.log("Workspaces result:", error ? error.message : "Success, table exists")
  
  console.log("Testing candidates table...")
  const { data: cData, error: cError } = await supabase.from('candidates').select('*').limit(1)
  console.log("Candidates result:", cError ? cError.message : `Success, found ${cData?.length} rows`)
  
  console.log("Testing jobs table...")
  const { data: jData, error: jError } = await supabase.from('jobs').select('*').limit(1)
  console.log("Jobs result:", jError ? jError.message : "Success, table exists")
  
  console.log("Testing workspace_members table...")
  const { data: wmData, error: wmError } = await supabase.from('workspace_members').select('*').limit(1)
  console.log("Workspace Members result:", wmError ? wmError.message : "Success, table exists")
}

checkSchema()
