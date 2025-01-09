import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getApiKeys = async () => {
  const { data: apikeys, error } = await supabase
    .from("apikeys")
    .select("*")
    .order("created_at", { ascending: true })
    .single()

  if (!apikeys) {
    throw new Error(error.message)
  }
  return apikeys
}

export const createApiKeys = async (apikeys: TablesInsert<"apikeys">) => {
  const { data: createdApiKeys, error } = await supabase
    .from("apikeys")
    .insert([apikeys])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdApiKeys
}

export const updateApiKeys = async (
  apikeyId: string,
  apikeys: TablesUpdate<"apikeys">
) => {
  const { data: updatedApiKeys, error } = await supabase
    .from("apikeys")
    .update(apikeys)
    .eq("id", apikeyId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedApiKeys
}

// export const deleteProfile = async (profileId: string) => {
//   const { error } = await supabase.from("profiles").delete().eq("id", profileId)

//   if (error) {
//     throw new Error(error.message)
//   }

//   return true
// }
