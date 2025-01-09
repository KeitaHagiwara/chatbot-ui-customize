import { ChatbotUIContext } from "@/context/context"
import { PROFILE_USERNAME_MAX, PROFILE_USERNAME_MIN } from "@/db/limits"
import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconUserPlus,
  IconCirclePlus,
  IconLoader2,
  IconCircleCheckFilled,
  IconCircleXFilled
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, useState, useRef, useContext, useCallback } from "react"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { LimitDisplay } from "../ui/limit-display"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Announcements } from "../utility/announcements"
import { toast } from "sonner"

interface UserAddProps {}

export const UserAdd: FC<UserAddProps> = ({}) => {
  const { profile, setProfile } = useContext(ChatbotUIContext)

  useHotkey("/", () => setIsOpen(prevState => !prevState))

  const [isOpen, setIsOpen] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleAddUser = async () => {
    // if (!newPassword) return toast.info("Please enter your new password.")

    // await supabase.auth.updateUser({ password: newPassword })

    toast.success("Add user successfully.")
    setIsOpen(false)
  }

  const [username, setUsername] = useState(profile?.username || "")
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout | null

    return (...args: any[]) => {
      const later = () => {
        if (timeout) clearTimeout(timeout)
        func(...args)
      }

      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username) return

      if (username.length < PROFILE_USERNAME_MIN) {
        setUsernameAvailable(false)
        return
      }

      if (username.length > PROFILE_USERNAME_MAX) {
        setUsernameAvailable(false)
        return
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        setUsernameAvailable(false)
        toast.error(
          "Username must be letters, numbers, or underscores only - no other characters or spacing allowed."
        )
        return
      }

      setLoadingUsername(true)

      const response = await fetch(`/api/username/available`, {
        method: "POST",
        body: JSON.stringify({ username })
      })

      const data = await response.json()
      const isAvailable = data.isAvailable

      setUsernameAvailable(isAvailable)

      if (username === profile?.username) {
        setUsernameAvailable(true)
      }

      setLoadingUsername(false)
    }, 500),
    []
  )
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconCirclePlus className="cursor-pointer hover:opacity-50 lg:size-[32px] lg:p-1" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* <DropdownMenuItem className="flex justify-between">
        </DropdownMenuItem> */}

        <div className="flex justify-between">
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Label>Username</Label>

                {/* <div className="text-xs">
                  {username !== profile.username ? (
                    usernameAvailable ? (
                      <div className="text-green-500">AVAILABLE</div>
                    ) : (
                      <div className="text-red-500">UNAVAILABLE</div>
                    )
                  ) : null}
                </div> */}
              </div>

              <div className="relative">
                <Input
                  className="pr-10"
                  placeholder="Username..."
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value)
                    checkUsernameAvailability(e.target.value)
                  }}
                  minLength={PROFILE_USERNAME_MIN}
                  maxLength={PROFILE_USERNAME_MAX}
                />

                {username !== profile?.username ? (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {loadingUsername ? (
                      <IconLoader2 className="animate-spin" />
                    ) : usernameAvailable ? (
                      <IconCircleCheckFilled className="text-green-500" />
                    ) : (
                      <IconCircleXFilled className="text-red-500" />
                    )}
                  </div>
                ) : null}
              </div>

              <LimitDisplay
                used={username.length}
                limit={PROFILE_USERNAME_MAX}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Label>Email</Label>

                <div className="text-xs">
                  {username !== profile?.username ? (
                    usernameAvailable ? (
                      <div className="text-green-500">AVAILABLE</div>
                    ) : (
                      <div className="text-red-500">UNAVAILABLE</div>
                    )
                  ) : null}
                </div>
              </div>

              <div className="relative">
                <Input
                  className="pr-10"
                  placeholder="Email..."
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value)
                    checkUsernameAvailability(e.target.value)
                  }}
                />

                {username !== profile?.username ? (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {loadingUsername ? (
                      <IconLoader2 className="animate-spin" />
                    ) : usernameAvailable ? (
                      <IconCircleCheckFilled className="text-green-500" />
                    ) : (
                      <IconCircleXFilled className="text-red-500" />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="m-1 flex items-center">
          <div className="ml-auto space-x-1">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button ref={buttonRef} onClick={handleAddUser}>
              Add
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
