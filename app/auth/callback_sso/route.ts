import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"

// Code Exchange用のルートハンドラ
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // 認証コードを使用して、Supabaseとのセッションを確立する
  if (code) {
    // const supabase = createRouteHandlerClient({ cookies });
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      throw new Error(
        error?.message || "An unexpected error occurred when logging in"
      )
    }

    const { data: userInfo, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user?.id)
      .single()

    if (!userInfo) {
      throw new Error(userError?.message)
    }
    // ユーザーが論理削除されていた場合はログインページへリダイレクトする
    if (userInfo.is_deleted) {
      const errMsg = "This user has been deleted by administrator."
      return redirect(`/?message=${errMsg}`)
    }

    const { data: homeWorkspace, error: homeWorkspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", data.user?.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(
        homeWorkspaceError?.message || "An unexpected error occurred"
      )
    }

    // サインイン後にリダイレクトするURLを指定
    // return NextResponse.redirect(requestUrl.origin);
    return redirect(`/${homeWorkspace.id}/chat`)
  }
}
