import { ChatbotUIContext } from "@/context/context"
// import {
//   PROFILE_CONTEXT_MAX,
//   PROFILE_DISPLAY_NAME_MAX,
//   PROFILE_USERNAME_MAX,
//   PROFILE_USERNAME_MIN
// } from "@/db/limits"
import {
  getUsers,
  getUserInfoByUserId,
  filterUsers,
  updateUserInfo
} from "@/db/users"
import { getApiKeys, createApiKeys, updateApiKeys } from "@/db/apikeys"
// import { uploadProfileImage } from "@/db/storage/profile-images"
// import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
// import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import { OpenRouterLLM } from "@/types"
import {
  // IconCircleCheckFilled,
  // IconCircleXFilled,
  // IconFileDownload,
  // IconLoader2,
  IconSettings,
  IconTrash,
  IconPlugConnected,
  IconPlugConnectedX
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FC, useCallback, useContext, useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
// import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
// import { LimitDisplay } from "../ui/limit-display"
import { WithTooltip } from "../ui/with-tooltip"
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableFooter,
  TableCell,
  TableRow,
  TableCaption
} from "../ui/table"
import { Checkbox } from "../ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
// import { TextareaAutosize } from "../ui/textarea-autosize"
// import { WithTooltip } from "../ui/with-tooltip"
// import { UserAdd } from "@/components/managements/user-add"

interface AdminPreferencesProps {}

export const AdminPreferences: FC<AdminPreferencesProps> = ({}) => {
  const {
    profile,
    setProfile,
    members,
    setMembers,
    apikeys,
    setApiKeys,
    envKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [activeUserOnly, setActiveUserOnly] = useState(true)
  const [searchStr, setSearchStr] = useState("")
  const [isDisplayed, setIsDisplayed] = useState(true)

  const [useAzureOpenai, setUseAzureOpenai] = useState(
    apikeys?.use_azure_openai
  )
  const [openaiAPIKey, setOpenaiAPIKey] = useState(
    apikeys?.openai_api_key || ""
  )
  const [openaiOrgID, setOpenaiOrgID] = useState(
    apikeys?.openai_organization_id || ""
  )
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState(
    apikeys?.azure_openai_api_key || ""
  )
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState(
    apikeys?.azure_openai_endpoint || ""
  )
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState(
    apikeys?.azure_openai_35_turbo_id || ""
  )
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState(
    apikeys?.azure_openai_45_turbo_id || ""
  )
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState(
    apikeys?.azure_openai_45_vision_id || ""
  )
  const [azureEmbeddingsID, setAzureEmbeddingsID] = useState(
    apikeys?.azure_openai_embeddings_id || ""
  )
  const [anthropicAPIKey, setAnthropicAPIKey] = useState(
    apikeys?.anthropic_api_key || ""
  )
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState(
    apikeys?.google_gemini_api_key || ""
  )
  const [mistralAPIKey, setMistralAPIKey] = useState(
    apikeys?.mistral_api_key || ""
  )
  const [groqAPIKey, setGroqAPIKey] = useState(apikeys?.groq_api_key || "")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState(
    apikeys?.perplexity_api_key || ""
  )
  const [openrouterAPIKey, setOpenrouterAPIKey] = useState(
    apikeys?.openrouter_api_key || ""
  )

  useEffect(() => {
    if (isOpen) {
      // 全ユーザーを取得する
      ;(async () => {
        setMembers(await filterUsers(searchStr, activeUserOnly))
      })()

      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSave = async () => {
    const apiKeyData = {
      openai_api_key: openaiAPIKey,
      openai_organization_id: openaiOrgID,
      anthropic_api_key: anthropicAPIKey,
      google_gemini_api_key: googleGeminiAPIKey,
      mistral_api_key: mistralAPIKey,
      groq_api_key: groqAPIKey,
      perplexity_api_key: perplexityAPIKey,
      use_azure_openai: useAzureOpenai,
      azure_openai_api_key: azureOpenaiAPIKey,
      azure_openai_endpoint: azureOpenaiEndpoint,
      azure_openai_35_turbo_id: azureOpenai35TurboID,
      azure_openai_45_turbo_id: azureOpenai45TurboID,
      azure_openai_45_vision_id: azureOpenai45VisionID,
      azure_openai_embeddings_id: azureEmbeddingsID,
      openrouter_api_key: openrouterAPIKey
    }

    const apiKeys = await getApiKeys()

    if (!apiKeys) {
      var updatedApiKeys = await createApiKeys(apiKeyData)
    } else {
      var updatedApiKeys = await updateApiKeys(apiKeys.id, apiKeyData)
    }

    toast.success("API Keys updated!")

    const providers = [
      "openai",
      "google",
      "azure",
      "anthropic",
      "mistral",
      "groq",
      "perplexity",
      "openrouter"
    ]

    providers.forEach(async provider => {
      let providerKey: keyof typeof apiKeyData

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof apiKeyData
      }

      const models = LLM_LIST_MAP[provider]
      const envKeyActive = envKeyMap[provider]

      if (!envKeyActive) {
        const hasApiKey = !!updatedApiKeys[providerKey]

        if (provider === "openrouter") {
          if (hasApiKey && availableOpenRouterModels.length === 0) {
            const openrouterModels: OpenRouterLLM[] =
              await fetchOpenRouterModels()
            setAvailableOpenRouterModels(prev => {
              const newModels = openrouterModels.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else {
            setAvailableOpenRouterModels([])
          }
        } else {
          if (hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev => {
              const newModels = models.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else if (!hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev =>
              prev.filter(model => !models.includes(model))
            )
          }
        }
      }
    })

    setIsOpen(false)
  }

  const handleChange = async (userId: string, checked: boolean) => {
    await updateUserInfo(userId, {
      is_admin: checked
    })

    const updatedUsers = await getUsers()
    setMembers(updatedUsers)

    toast.success("Administrator privileges updated!")
  }

  const handleUserActivation = async (userId: string, isDeleted: boolean) => {
    console.log(userId)
    console.log(isDeleted)
    await updateUserInfo(userId, {
      is_deleted: !isDeleted
    })

    const updatedUsers = await getUsers()
    setMembers(updatedUsers)

    toast.success("User activity updated!")
  }

  const filteringUsersByDeleteFlg = async (checked: boolean) => {
    setMembers(await filterUsers(searchStr, checked))
    setActiveUserOnly(checked)
  }

  const filteringUsersByEmail = async (val: string) => {
    setMembers(await filterUsers(val, activeUserOnly))
    setSearchStr(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  if (!profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {profile.image_url ? (
          <Image
            className="mt-2 size-[34px] cursor-pointer rounded hover:opacity-50"
            src={profile.image_url + "?" + new Date().getTime()}
            height={34}
            width={34}
            alt={"Image"}
          />
        ) : (
          <Button size="icon" variant="ghost">
            <IconSettings size={SIDEBAR_ICON_SIZE} />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between space-x-2">
              <div>Admin Preferences</div>
              {/* <UserAdd /> */}
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="keys">
            <TabsList className="mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="keys" onClick={() => setIsDisplayed(true)}>
                API Keys
              </TabsTrigger>
              <TabsTrigger value="users" onClick={() => setIsDisplayed(false)}>
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-4 space-y-4" value="keys">
              <div className="mt-5 space-y-2">
                <Label className="flex items-center">
                  {useAzureOpenai
                    ? envKeyMap["azure"]
                      ? ""
                      : "Azure OpenAI API Key"
                    : envKeyMap["openai"]
                      ? ""
                      : "OpenAI API Key"}

                  <Button
                    className={cn(
                      "h-[18px] w-[150px] text-[11px]",
                      (useAzureOpenai && !envKeyMap["azure"]) ||
                        (!useAzureOpenai && !envKeyMap["openai"])
                        ? "ml-3"
                        : "mb-3"
                    )}
                    onClick={() => setUseAzureOpenai(!useAzureOpenai)}
                  >
                    {useAzureOpenai
                      ? "Switch To Standard OpenAI"
                      : "Switch To Azure OpenAI"}
                  </Button>
                </Label>

                {useAzureOpenai ? (
                  <>
                    {envKeyMap["azure"] ? (
                      <Label>Azure OpenAI API key set by admin.</Label>
                    ) : (
                      <Input
                        placeholder="Azure OpenAI API Key"
                        type="password"
                        value={azureOpenaiAPIKey}
                        onChange={e => setAzureOpenaiAPIKey(e.target.value)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {envKeyMap["openai"] ? (
                      <Label>OpenAI API key set by admin.</Label>
                    ) : (
                      <Input
                        placeholder="OpenAI API Key"
                        type="password"
                        value={openaiAPIKey}
                        onChange={e => setOpenaiAPIKey(e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="ml-8 space-y-3">
                {useAzureOpenai ? (
                  <>
                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_openai_endpoint"] ? (
                          <Label className="text-xs">
                            Azure endpoint set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure Endpoint</Label>

                            <Input
                              placeholder="https://your-endpoint.openai.azure.com"
                              value={azureOpenaiEndpoint}
                              onChange={e =>
                                setAzureOpenaiEndpoint(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_gpt_35_turbo_name"] ? (
                          <Label className="text-xs">
                            Azure GPT-3.5 Turbo deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure GPT-3.5 Turbo Deployment Name</Label>

                            <Input
                              placeholder="Azure GPT-3.5 Turbo Deployment Name"
                              value={azureOpenai35TurboID}
                              onChange={e =>
                                setAzureOpenai35TurboID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_gpt_45_turbo_name"] ? (
                          <Label className="text-xs">
                            Azure GPT-4.5 Turbo deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure GPT-4.5 Turbo Deployment Name</Label>

                            <Input
                              placeholder="Azure GPT-4.5 Turbo Deployment Name"
                              value={azureOpenai45TurboID}
                              onChange={e =>
                                setAzureOpenai45TurboID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_gpt_45_vision_name"] ? (
                          <Label className="text-xs">
                            Azure GPT-4.5 Vision deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure GPT-4.5 Vision Deployment Name</Label>

                            <Input
                              placeholder="Azure GPT-4.5 Vision Deployment Name"
                              value={azureOpenai45VisionID}
                              onChange={e =>
                                setAzureOpenai45VisionID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_embeddings_name"] ? (
                          <Label className="text-xs">
                            Azure Embeddings deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure Embeddings Deployment Name</Label>

                            <Input
                              placeholder="Azure Embeddings Deployment Name"
                              value={azureEmbeddingsID}
                              onChange={e =>
                                setAzureEmbeddingsID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      {envKeyMap["openai_organization_id"] ? (
                        <Label className="text-xs">
                          OpenAI Organization ID set by admin.
                        </Label>
                      ) : (
                        <>
                          <Label>OpenAI Organization ID</Label>

                          <Input
                            placeholder="OpenAI Organization ID (optional)"
                            disabled={
                              !!process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION_ID
                            }
                            type="password"
                            value={openaiOrgID}
                            onChange={e => setOpenaiOrgID(e.target.value)}
                          />
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["anthropic"] ? (
                  <Label>Anthropic API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Anthropic API Key</Label>
                    <Input
                      placeholder="Anthropic API Key"
                      type="password"
                      value={anthropicAPIKey}
                      onChange={e => setAnthropicAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["google"] ? (
                  <Label>Google Gemini API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Google Gemini API Key</Label>
                    <Input
                      placeholder="Google Gemini API Key"
                      type="password"
                      value={googleGeminiAPIKey}
                      onChange={e => setGoogleGeminiAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["mistral"] ? (
                  <Label>Mistral API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Mistral API Key</Label>
                    <Input
                      placeholder="Mistral API Key"
                      type="password"
                      value={mistralAPIKey}
                      onChange={e => setMistralAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["groq"] ? (
                  <Label>Groq API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Groq API Key</Label>
                    <Input
                      placeholder="Groq API Key"
                      type="password"
                      value={groqAPIKey}
                      onChange={e => setGroqAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["perplexity"] ? (
                  <Label>Perplexity API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Perplexity API Key</Label>
                    <Input
                      placeholder="Perplexity API Key"
                      type="password"
                      value={perplexityAPIKey}
                      onChange={e => setPerplexityAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["openrouter"] ? (
                  <Label>OpenRouter API key set by admin.</Label>
                ) : (
                  <>
                    <Label>OpenRouter API Key</Label>
                    <Input
                      placeholder="OpenRouter API Key"
                      type="password"
                      value={openrouterAPIKey}
                      onChange={e => setOpenrouterAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent className="mt-4 space-y-3" value="users">
              <Input
                ref={inputRef}
                className="w-full"
                placeholder="Search Users..."
                onChange={e => filteringUsersByEmail(e.target.value)}
              />

              <div className="m-2 flex justify-between text-xs">
                <div className="items-center space-x-2">
                  <Checkbox
                    checked={activeUserOnly}
                    onCheckedChange={(value: boolean) =>
                      filteringUsersByDeleteFlg(value)
                    }
                  />
                  <Label>Active User Only</Label>
                </div>
                <Label>Total: {members.length} users</Label>
              </div>
              <Table className="my-custom-table-class">
                {/* <TableCaption>Sample Table Caption</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>isAdmin</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id}>
                      {member.is_deleted ? (
                        <TableCell
                          style={{
                            textDecoration: "line-through",
                            color: "gray"
                          }}
                        >
                          {member.email}
                        </TableCell>
                      ) : (
                        <TableCell>{member.email}</TableCell>
                      )}
                      <TableCell>
                        {member.id === profile.user_id ? (
                          <WithTooltip
                            display={
                              <div>Can NOT change my own admin privileges</div>
                            }
                            trigger={
                              <Checkbox
                                checked={member.is_admin}
                                onCheckedChange={(value: boolean) =>
                                  handleChange(member.id, value)
                                }
                                disabled
                              />
                            }
                          />
                        ) : (
                          <Checkbox
                            checked={member.is_admin}
                            onCheckedChange={(value: boolean) =>
                              handleChange(member.id, value)
                            }
                          />
                        )}
                      </TableCell>
                      {member.is_deleted ? (
                        <TableCell>
                          <Button
                            variant="ghost"
                            style={{ background: "none", color: "forestgreen" }}
                            onClick={async () =>
                              handleUserActivation(member.id, member.is_deleted)
                            }
                          >
                            <IconPlugConnected />
                          </Button>
                        </TableCell>
                      ) : (
                        <TableCell>
                          {member.id === profile.user_id ? (
                            <WithTooltip
                              display={
                                <div>Can NOT deactivate my own account</div>
                              }
                              trigger={
                                <Button
                                  variant="ghost"
                                  style={{ background: "none" }}
                                  onClick={async () =>
                                    handleUserActivation(
                                      member.id,
                                      member.is_deleted
                                    )
                                  }
                                  disabled
                                >
                                  <IconTrash />
                                </Button>
                              }
                            />
                          ) : (
                            <Button
                              variant="ghost"
                              style={{ background: "none" }}
                              onClick={async () =>
                                handleUserActivation(
                                  member.id,
                                  member.is_deleted
                                )
                              }
                            >
                              <IconTrash />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
                {/* <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter> */}
              </Table>
            </TabsContent>
          </Tabs>
        </div>

        {isDisplayed ? (
          <div className="mt-6 flex items-center">
            <div className="ml-auto space-x-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>

              <Button ref={buttonRef} onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
