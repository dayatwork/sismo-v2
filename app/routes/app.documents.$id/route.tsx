import {
  redirect,
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import invariant from "tiny-invariant";
import { useClipboard, useDebouncedValue } from "@mantine/hooks";
import { File, Globe, Image, Smile } from "lucide-react";

import { Editor } from "~/components/editor";
import { IconPicker } from "~/components/icon-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { requireUser } from "~/utils/auth.server";
import { cn } from "~/lib/utils";
import {
  getUserDocumentById,
  updateUserDocumentById,
} from "~/services/document.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  const loggedInUser = await requireUser(request);

  if (!loggedInUser) {
    return redirect("/app");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update-title") {
    const title = formData.get("title");
    invariant(typeof title === "string", "Required");
    const document = await updateUserDocumentById({
      userId: loggedInUser.id,
      documentId,
      title,
    });
    return json({ document });
  } else if (intent === "update-content") {
    const content = formData.get("content");
    invariant(typeof content === "string", "Required");
    const document = await updateUserDocumentById({
      userId: loggedInUser.id,
      documentId,
      content,
    });
    return json({ document });
  } else if (intent === "update-status") {
    const isPublished = formData.get("isPublished");
    invariant(
      typeof isPublished === "string" &&
        ["true", "false"].includes(isPublished),
      "Required"
    );
    const document = await updateUserDocumentById({
      userId: loggedInUser.id,
      documentId,
      isPublished: isPublished === "true",
    });
    return json({ document });
  } else if (intent === "update-icon") {
    const icon = formData.get("icon");
    invariant(typeof icon === "string", "Required");
    try {
      const document = await updateUserDocumentById({
        userId: loggedInUser.id,
        documentId,
        icon,
      });
      return json({ document });
    } catch (error) {
      return json({ message: "Error" });
    }
  }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/app/documents`);
  }

  const loggedInUser = await requireUser(request);

  if (!loggedInUser) {
    return redirect("/app");
  }

  const document = await getUserDocumentById({
    documentId,
    userId: loggedInUser.id,
  });

  if (!document) {
    return redirect(`/app/documents`);
  }

  const APP_URL = process.env.APP_URL;

  return json({ document, APP_URL });
}

export default function Document() {
  const { document, APP_URL } = useLoaderData<typeof loader>();
  const titleFetcher = useFetcher();
  const contentFetcher = useFetcher();
  const statusFetcher = useFetcher();
  const iconFetcher = useFetcher();
  const [content, setContent] = useState(document.content);
  const [debounced] = useDebouncedValue(content, 1000);
  const navigation = useNavigation();
  const navigate = useNavigate();
  const clipboard = useClipboard({ timeout: 500 });
  const { id } = useParams<{ id: string }>();

  const submitContent = contentFetcher.submit;

  useEffect(() => {
    submitContent(
      { intent: "update-content", content: debounced },
      { method: "POST" }
    );
  }, [debounced, submitContent]);

  const handleUpdateTitle = (
    e: React.FocusEvent<HTMLInputElement, Element>
  ) => {
    if (e.target.value !== document.title) {
      titleFetcher.submit(e.currentTarget.form, { method: "POST" });
    }
  };

  const handleUpdateStatus = ({ isPublished }: { isPublished: boolean }) => {
    statusFetcher.submit(
      { intent: "update-status", isPublished },
      { method: "POST" }
    );
  };

  const onChange = useCallback((c: string) => {
    setContent(c);
  }, []);

  const handleIconSelect = (icon: string) => {
    iconFetcher.submit({ intent: "update-icon", icon }, { method: "POST" });
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/app/documents/${id}/upload-image`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.url;
  };

  return (
    <>
      <Outlet />
      <div className="h-44 border-b pb-6 relative z-10 group">
        {!!document.coverImage && (
          <div className="absolute inset-0 overflow-hidden items-center justify-center flex">
            <img
              src={document.coverImage}
              alt="cover"
              className="object-cover group-hover:brightness-[0.1] transition-all w-full"
            />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="absolute top-32 opacity-0 group-hover:opacity-100 flex gap-2">
            {navigation.state !== "loading" && (
              <ClientOnly>
                {() => (
                  <IconPicker asChild onChange={handleIconSelect}>
                    <Button
                      className="text-muted-foreground text-xs"
                      variant="outline"
                      size="sm"
                    >
                      <Smile className="h-4 w-4 mr-2" />
                      {document.icon ? "Change icon" : "Add icon"}
                    </Button>
                  </IconPicker>
                )}
              </ClientOnly>
            )}

            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
              onClick={() => navigate("change-cover")}
            >
              <Image className="h-4 w-4 mr-2" />
              {document.coverImage ? "Change cover" : "Add cover"}
            </Button>
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-160px)] overflow-auto">
        <div className="max-w-4xl mx-auto pt-6 pb-14 px-4">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-[40px] flex items-center">
                <p className="text-3xl">{document.icon}</p>
              </div>
              <titleFetcher.Form method="post">
                <input type="hidden" name="intent" value="update-title" />
                <input
                  name="title"
                  className="text-4xl font-bold outline-none bg-transparent"
                  defaultValue={document.title}
                  onBlur={handleUpdateTitle}
                />
              </titleFetcher.Form>
            </div>

            <div className="flex gap-2 items-center">
              {(contentFetcher.state === "submitting" ||
                titleFetcher.state === "submitting") && (
                <p className="text-muted-foreground">Saving...</p>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      document.isPublished &&
                        "text-green-600 hover:text-green-700"
                    )}
                  >
                    {document.isPublished ? "Published" : "Draft"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  {document.isPublished ? (
                    <>
                      <div className="flex mb-4">
                        <input
                          className="flex-1 rounded-r-none outline-none bg-transparent border rounded-l-md px-2 h-9 text-sm"
                          readOnly
                          value={`${APP_URL}/documents/${document.id}`}
                        />
                        <Button
                          className="rounded-l-none"
                          onClick={() =>
                            clipboard.copy(
                              `${APP_URL}/documents/${document.id}`
                            )
                          }
                        >
                          {clipboard.copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          handleUpdateStatus({ isPublished: false })
                        }
                      >
                        <File className="mr-2 w-4 h-4" />
                        Unpublish Document
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={() => handleUpdateStatus({ isPublished: true })}
                    >
                      <Globe className="mr-2 w-4 h-4" />
                      Publish Document
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
              {document.isPublished && (
                <Button size="icon" asChild variant="outline">
                  <a
                    href={`${APP_URL}/documents/${document.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          {navigation.state !== "loading" && (
            <ClientOnly>
              {() => (
                <Editor
                  initialContent={document.content}
                  onChange={onChange}
                  uploadFile={handleUpload}
                />
              )}
            </ClientOnly>
          )}
        </div>
      </div>
    </>
  );
}
