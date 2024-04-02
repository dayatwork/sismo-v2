import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { File, Globe, Plus, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { createDocument, getUserDocuments } from "~/services/document.server";
import { requireUser } from "~/utils/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { cn } from "~/lib/utils";

export async function action({ request }: ActionFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const document = await createDocument({
    userId: loggedInUser.id,
  });

  return redirectWithToast(`/app/documents/${document.id}`, {
    description: "Document created",
    type: "success",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await requireUser(request);

  const documents = await getUserDocuments({
    userId: loggedInUser.id,
  });

  return json({ documents });
}

export default function Documents() {
  const { documents } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-64px)] items-stretch overflow-hidden">
      <div className="flex-1">
        <Outlet />
      </div>
      <div className="w-[280px] border-l py-4">
        <h1 className="font-semibold mb-4 px-4">Your Documents</h1>
        <Form method="post" className="px-4">
          <Button variant="outline" className="w-full" type="submit">
            <Plus className="-ml-4 mr-2 w-4 h-4" /> New Document
          </Button>
        </Form>
        <Separator className="my-4" />
        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-60">
            <img src="/no-data.svg" alt="no data" className="w-10" />
            <p className="text-muted-foreground mt-2">No documents</p>
          </div>
        )}
        <ul className="px-4 space-y-1">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center">
              <div
                className={cn(
                  "flex-1 flex justify-between items-center group hover:bg-accent pl-2 pr-1 py-1 rounded",
                  location.pathname.includes(document.id) && "bg-accent"
                )}
              >
                <Link
                  to={document.id}
                  className="group-hover:text-accent-foreground flex-1 font-semibold line-clamp-1 text-sm rounded-sm flex gap-1 items-center"
                >
                  {document.icon ? (
                    <span className="mr-px">{document.icon}</span>
                  ) : (
                    <File className="w-4 h-4 text-muted-foreground px-px mx-0.5" />
                  )}
                  <span>{document.title}</span>
                  {document.isPublished && (
                    <Globe className="ml-2 w-4 h-4 text-green-600" />
                  )}
                </Link>

                <button
                  className="bg-red-100 hover:bg-red-300 dark:bg-red-900 dark:hover:bg-red-700 text-red-600 dark:text-red-200 opacity-0 group-hover:opacity-100 p-1 rounded-sm"
                  onClick={() => {
                    navigate(`${document.id}/delete`);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
