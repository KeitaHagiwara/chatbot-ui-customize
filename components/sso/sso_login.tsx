"use client"

import { ReactNode, FC } from "react"
import { Button } from "../ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Provider } from "@supabase/auth-js"

interface SSOAuthButtonProp {
  providerName: string
  providerId: Provider
  callbackUrl: string
  brandIcon: ReactNode
}

export const SSOAuthButton: FC<SSOAuthButtonProp> = ({
  providerName,
  providerId,
  callbackUrl,
  brandIcon
}) => {
  // Supabaseクライアント作成
  const supabase = createClientComponentClient()

  // サインイン処理
  const handleSignIn = async () => {
    // GitHub OAuthで認証する
    await supabase.auth.signInWithOAuth({
      provider: providerId,
      options: {
        redirectTo: callbackUrl
      }
    })
  }

  return (
    <>
      <Button
        onClick={handleSignIn}
        className="border-foreground/20 m-2 w-[300px] rounded-md border bg-blue-500 text-white"
      >
        <div className="flex justify-center">
          {brandIcon}
          <span className="ml-2">Login with {providerName}</span>
        </div>
      </Button>
    </>
  )
}
