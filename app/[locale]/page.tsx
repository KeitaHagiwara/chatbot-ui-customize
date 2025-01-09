"use client"

import { useEffect } from "react"
import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { useTheme } from "next-themes"
import Link from "next/link"
import { SSOAuthButton } from "@/components/sso/sso_login"
import { toast } from "sonner"
// import {
//   TablerIconsProps,
//   IconArrowRight,
//   IconBrandGithub,
// } from "@tabler/icons-react"

export default function HomePage({
  searchParams
}: {
  searchParams: { message: string }
}) {
  const { theme } = useTheme()

  useEffect(() => {
    setTimeout(() => {
      if (Object.keys(searchParams).length > 0) {
        toast.error(searchParams.message)
      }
    }, 200)
  }, [searchParams])

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>

      <div className="mt-2 text-4xl font-bold">Chatbot UI</div>

      {/* <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
        href="/login"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link> */}

      <SSOAuthButton
        providerName="Github"
        providerId="github"
        callbackUrl="http://localhost:3000/auth/callback_sso"
      />

      {/* {searchParams?.message && (
        <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center">
          {searchParams.message}
        </p>
      )} */}
    </div>
  )
}
