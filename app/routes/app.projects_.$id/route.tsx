import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import Breadcrumbs from "~/components/ui/breadcrumbs";
import MainContainer from "~/components/main-container";
import { ProjectCard } from "~/components/projects/project-card";
import { cn } from "~/lib/utils";
import { getProjectById } from "~/services/project.server";
import { requirePermission } from "~/utils/auth.server";

const subPages = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "stages",
    label: "Stages",
  },
  {
    id: "documents",
    label: "Documents",
  },
  // {
  //   id: "expenses",
  //   label: "Expenses",
  // },
  {
    id: "clients",
    label: "Clients",
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requirePermission(request, "manage:project");

  const projectId = params.id;
  if (!projectId) {
    return redirect(`/app/projects`);
  }

  const project = await getProjectById({ id: projectId });

  if (!project) {
    return redirect(`/app/projects`);
  }

  return json({ project });
}

export default function ProjectDetails() {
  const { project } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  return (
    <MainContainer>
      <Breadcrumbs
        pages={[
          { name: "Projects", href: `/app/projects`, current: false },
          {
            name: project.name,
            href: `/app/projects/${project.id}`,
            current: false,
          },
        ]}
      />
      <div className="mt-4 flex items-start gap-4">
        <div className="w-[280px]">
          <ProjectCard
            name={project.name}
            code={project.code}
            description={project.description}
            status={project.status}
            champion={project.champion}
            product={project.product}
            service={project.service}
          />
        </div>
        <div className="flex-1">
          <nav className="inline-flex border rounded-md overflow-hidden mb-4 bg-neutral-50 dark:bg-neutral-900">
            {subPages.map((subPage) => (
              <Link
                key={subPage.id}
                to={subPage.id}
                className={cn(
                  pathname.endsWith(subPage.id)
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80"
                    : "hover:bg-primary/10",
                  "border-l py-2 text-center font-semibold px-6"
                )}
              >
                {subPage.label}
              </Link>
            ))}
          </nav>
          <Outlet context={{ project }} />
        </div>
      </div>
    </MainContainer>
  );
}
