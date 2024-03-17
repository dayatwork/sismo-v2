import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";

import { Editor } from "~/components/editor";
import { getPublicDocumentById } from "~/services/document.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const documentId = params.id;
  if (!documentId) {
    return redirect(`/`);
  }

  const document = await getPublicDocumentById({ documentId });

  if (!document) {
    throw json(null, { status: 404 });
  }

  return json({ document });
}

export default function Document() {
  const { document } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="h-screen">
      <div className="h-44 border-b pb-6 relative z-10 dark:bg-[#1F1F1F]">
        {!!document.coverImage && (
          <div className="absolute inset-0 overflow-hidden items-center justify-center flex">
            <img
              src={document.coverImage}
              alt="cover"
              className="object-cover group-hover:brightness-[0.1] transition-all w-full"
            />
          </div>
        )}
      </div>
      <div className="h-[calc(100%-160px)] overflow-auto dark:bg-[#1F1F1F]">
        <div className="max-w-4xl mx-auto pt-6 pb-14 px-4">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-[40px] flex items-center">
                <p className="text-3xl">{document.icon}</p>
              </div>
              <h1 className="text-4xl font-bold outline-none bg-transparent">
                {document.title}
              </h1>
            </div>
          </div>
          {navigation.state !== "loading" && (
            <ClientOnly>
              {() => (
                <Editor initialContent={document.content} editable={false} />
              )}
            </ClientOnly>
          )}
        </div>
      </div>
    </div>
  );
}
