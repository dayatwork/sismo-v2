import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { LayoutGrid, PlusIcon, Table2 } from "lucide-react";
import { useRef } from "react";

import MainContainer from "~/components/main-container";
import { ProjectCard } from "~/components/projects/project-card";
import { SearchInput } from "~/components/search-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { getProjectsWithStatistic } from "~/services/project.server";
import { requirePermission } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const organizationId = params.orgId;
  if (!organizationId) {
    return redirect("/app");
  }

  const loggedInUser = await requirePermission(
    request,
    organizationId,
    "manage:project"
  );

  if (!loggedInUser) {
    return redirect(`/app/${organizationId}`);
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;

  const projects = await getProjectsWithStatistic({ organizationId, search });

  return json({ projects });
}

export default function Projects() {
  const { projects } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") || undefined;
  const searchRef = useRef<HTMLInputElement | null>(null);

  const handleSearchForm = (search: string) => {
    setSearchParams((prev) => {
      if (search) {
        prev.set("search", search);
      } else {
        prev.delete("search");
      }
      // prev.set("page", "1");
      return prev;
    });
  };
  const handleClearSearchForm = () => {
    setSearchParams((prev) => {
      prev.delete("search");
      // prev.set("page", "1");
      return prev;
    });
    if (searchRef.current?.value) {
      searchRef.current!.value = "";
    }
  };

  return (
    <>
      <Outlet />
      <MainContainer>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>

          <Button asChild>
            <Link to="new">Create New Project</Link>
          </Button>
        </div>

        <Tabs className="mt-4" defaultValue="card">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="card">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Card View
              </TabsTrigger>
              <TabsTrigger value="table">
                <Table2 className="w-4 h-4 mr-2" /> Table View
              </TabsTrigger>
            </TabsList>
            <SearchInput
              key={searchText}
              onClear={handleClearSearchForm}
              onSearch={handleSearchForm}
              placeholder="Search by code or name"
              defaultValue={searchText}
            />
          </div>
          <TabsContent value="card">
            <div className="mt-4 grid grid-cols-4 gap-6 items-start">
              {projects.length === 0 && (
                <Link to="new">
                  <div className="border p-6 rounded-md flex flex-col gap-6 items-center justify-center hover:bg-accent border-dashed h-[285px]">
                    <PlusIcon className="h-10 w-10" />
                    <p className="text-xl font-semibold">Create New Project</p>
                  </div>
                </Link>
              )}
              {projects.map((project) => {
                return (
                  <ProjectCard
                    animateWhenHover
                    key={project.id}
                    onClick={() => navigate(project.id)}
                    name={project.name}
                    description={project.description}
                    code={project.code}
                    status={project.status}
                    champion={project.champion}
                    product={project.product}
                    service={project.service}
                    bottom={
                      <Accordion
                        type="single"
                        collapsible
                        className="p-0"
                        onClick={() => console.log("accordion clicked")}
                      >
                        <AccordionItem
                          value="progress"
                          className="border-none px-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("item clicked");
                          }}
                        >
                          <AccordionTrigger
                            value="progress"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("trigger clicked");
                            }}
                          >
                            Progress
                          </AccordionTrigger>
                          <AccordionContent>
                            {project.stages.length === 0 && (
                              <p className="py-5 text-center text-sm text-muted-foreground bg-background rounded border border-dashed">
                                No stages
                              </p>
                            )}
                            <ul className="space-y-1">
                              {project.stages.map((stage) => {
                                const milestoneCompletionPercentage =
                                  stage.milestones.reduce((acc, curr) => {
                                    return (
                                      acc +
                                      (curr.tasks.filter(
                                        (task) => task.status === "DONE"
                                      ).length /
                                        curr.tasks.filter(
                                          (task) => task.status !== "CANCELED"
                                        ).length) *
                                        (curr.weight || 0)
                                    );
                                  }, 0);
                                return (
                                  <li
                                    key={stage.id}
                                    className="rounded bg-background text-sm border cursor-auto"
                                  >
                                    <dl className="p-3">
                                      <dt className="flex justify-between items-center mb-2 font-semibold">
                                        <p className="flex gap-2 font-semibold">
                                          <span
                                            className={cn(
                                              " text-white w-5 flex items-center justify-center rounded-sm",
                                              stage.status === "COMPLETED" &&
                                                "bg-green-600",
                                              stage.status === "ONGOING" &&
                                                "bg-blue-600",
                                              stage.status === "ONHOLD" &&
                                                "bg-orange-600",
                                              stage.status === "UNSTARTED" &&
                                                "bg-neutral-600"
                                            )}
                                          >
                                            {stage.stageOrder}
                                          </span>
                                          <span>{stage.name}</span>
                                        </p>
                                        <span>
                                          {milestoneCompletionPercentage}%
                                        </span>
                                      </dt>
                                      <dd>
                                        <Progress
                                          value={milestoneCompletionPercentage}
                                        />
                                      </dd>
                                    </dl>
                                  </li>
                                );
                              })}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    }
                  />
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="table">
            <div className="mt-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[200px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Champion</TableHead>
                    <TableHead>
                      <span className="sr-only">Action</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-10 text-muted-foreground text-center"
                      >
                        No projects
                      </TableCell>
                    </TableRow>
                  )}
                  {projects.map((project) => (
                    <TableRow key={project.id} className="group">
                      <TableCell className="pl-6 w-[200px]">
                        {project.code}
                      </TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.champion?.name || "-"}</TableCell>
                      <TableCell className="w-[100px] opacity-0 group-hover:opacity-100">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={project.id}>Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </MainContainer>
    </>
  );
}
