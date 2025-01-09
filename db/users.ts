import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getUsers = async () => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("email", { ascending: true })

  if (!users) {
    throw new Error(error.message)
  }
  return users
}

export const filterUsers = async (
  searchVal: string,
  activeUserOnly: boolean
) => {
  if (!activeUserOnly) {
    var { data: users, error } = await supabase
      .from("users")
      .select("*")
      .like("email", "%" + searchVal + "%")
      .order("email", { ascending: true })
  } else {
    var { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_deleted", !activeUserOnly)
      .like("email", "%" + searchVal + "%")
      .order("email", { ascending: true })
  }

  if (!users) {
    throw new Error(error?.message)
  }
  return users
}

export const getUserInfoByUserId = async (userId: string) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (!user) {
    throw new Error(error.message)
  }
  return user
}

export const updateUserInfo = async (
  userId: string,
  users: TablesUpdate<"users">
) => {
  const { data: updatedUsers, error } = await supabase
    .from("users")
    .update(users)
    .eq("id", userId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedUsers
}
