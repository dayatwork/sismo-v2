// import {
//   Form,
//   useActionData,
//   useLoaderData,
//   useNavigate,
//   useNavigation,
//   useParams,
// } from "@remix-run/react";
// import {
//   json,
//   type ActionFunctionArgs,
//   type LoaderFunctionArgs,
//   redirect,
// } from "@remix-run/node";
// import { parse } from "@conform-to/zod";
// import { z } from "zod";
// import { Modal, Dialog, Button } from "react-aria-components";
// import { useForm } from "@conform-to/react";

// import { cn } from "~/lib/utils";
// import { buttonVariants } from "~/components/ui/button";
// import { authenticator } from "~/services/auth.server";
// import { Progress } from "~/components/ui/progress";
// import { useState } from "react";
// import { Label } from "~/components/ui/label";
// import { Textarea } from "~/components/ui/textarea";
// import { getOrganizationUser } from "~/services/user.server";
// import {
//   organizationUserToLoggedInUser,
//   requireOrganizationUser,
// } from "~/utils/auth.server";
// import {
//   clockout,
//   getUserTimeTrackerById,
// } from "~/services/time-tracker.server";
// import { emitter } from "~/utils/sse/emitter.server";

// const schema = z.object({
//   taskCompletion: z.number().min(0).max(100),
//   note: z.string().optional(),
// });

// export async function action({ request, params }: ActionFunctionArgs) {
//   const organizationId = params.orgId;
//   if (!organizationId) {
//     return redirect("/app");
//   }

//   const trackerId = params.id;
//   if (!trackerId) {
//     return redirect(`/app/${organizationId}/time-tracker`);
//   }

//   const loggedInUser = await requireOrganizationUser(request, organizationId);

//   if (!loggedInUser) {
//     return redirect("/app");
//   }

//   const formData = await request.formData();

//   const submission = parse(formData, { schema });

//   if (submission.intent !== "submit" || !submission.value) {
//     return json(submission);
//   }

//   const { taskCompletion, note } = submission.value;

//   await clockout({
//     taskCompletion,
//     trackerId,
//     note,
//     organizationId,
//     userId: loggedInUser.id,
//   });

//   emitter.emit(`tracker-${loggedInUser.id}-changed`);
//   emitter.emit(`${organizationId}-employee-work-status-change`);

//   return redirect(`/app/${organizationId}/time-tracker`);
// }

// export async function loader({ request, params }: LoaderFunctionArgs) {
//   const organizationId = params.orgId;
//   if (!organizationId) {
//     return redirect("/app");
//   }

//   const trackerId = params.id;
//   if (!trackerId) {
//     return redirect(`/app/${organizationId}/time-tracker`);
//   }

//   const { id: userId } = await authenticator.isAuthenticated(request, {
//     failureRedirect: "/login",
//   });

//   const organizationUser = await getOrganizationUser({
//     organizationId,
//     userId,
//   });
//   const loggedInUser = organizationUserToLoggedInUser(organizationUser);

//   if (!loggedInUser) {
//     return await authenticator.logout(request, { redirectTo: "/app" });
//   }

//   const tracker = await getUserTimeTrackerById({
//     trackerId,
//     userId: loggedInUser.id,
//   });

//   if (!tracker || tracker.endAt) {
//     return redirect(`/app/${organizationId}/time-tracker`);
//   }

//   return json({ tracker });
// }

// export default function StopTimeTracker() {
//   const lastSubmission = useActionData<typeof action>();
//   const { tracker } = useLoaderData<typeof loader>();
//   const navigate = useNavigate();
//   const { orgId } = useParams<{ orgId: string }>();
//   const [progress, setProgress] = useState(tracker.taskCompletion || 0);
//   const navigation = useNavigation();
//   const submitting = navigation.state === "submitting";

//   const [form, fields] = useForm({
//     lastSubmission,
//     shouldValidate: "onSubmit",
//   });

//   return (
//     <Modal
//       isDismissable
//       isOpen={true}
//       onOpenChange={() => navigate(`/app/${orgId}/time-tracker`)}
//       className="overflow-hidden w-full max-w-md"
//     >
//       <Dialog className="bg-background border rounded-md p-6">
//         <Form method="post" {...form.props}>
//           <h1 className="text-lg font-semibold">Stop The Tracker</h1>
//           <div className="relative mt-3">
//             <p
//               className="absolute font-semibold text-xs -translate-x-2"
//               style={{ left: `${progress}%` }}
//             >
//               {progress}%
//             </p>
//           </div>
//           <Progress className="mt-10" value={progress} />

//           <div className="mt-4 grid grid-cols-4 gap-4">
//             <Button
//               onPress={() => setProgress(tracker.taskCompletion)}
//               className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
//               isDisabled={progress === tracker.taskCompletion}
//             >
//               Reset
//             </Button>
//             <Button
//               onPress={() =>
//                 setProgress((prev) =>
//                   prev - 10 > tracker.taskCompletion
//                     ? prev - 10
//                     : tracker.taskCompletion
//                 )
//               }
//               className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
//               isDisabled={progress <= tracker.taskCompletion}
//             >
//               -10%
//             </Button>
//             <Button
//               onPress={() =>
//                 setProgress((prev) => (prev + 10 < 100 ? prev + 10 : 100))
//               }
//               className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
//               isDisabled={progress >= 100}
//             >
//               +10%
//             </Button>
//             <Button
//               onPress={() => setProgress(100)}
//               className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
//               isDisabled={progress === 100}
//             >
//               100%
//             </Button>
//           </div>
//           <input type="hidden" name="taskCompletion" value={progress} />
//           <div className="mt-4 grid gap-2">
//             <div className="flex justify-between items-center">
//               <Label htmlFor="note">Note</Label>
//               <span className="text-sm text-muted-foreground leading-none">
//                 optional
//               </span>
//             </div>
//             <Textarea
//               id="note"
//               name="note"
//               defaultValue={fields.description.defaultValue}
//             />
//             <p className="-mt-1.5 text-sm text-red-600 font-semibold">
//               {fields.description.errors}
//             </p>
//           </div>
//           <div className="mt-8 flex justify-end gap-2 w-full">
//             <Button
//               type="button"
//               className={cn(buttonVariants({ variant: "ghost" }))}
//               onPress={() => navigate(`/app/${orgId}/time-tracker`)}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               className={cn(buttonVariants())}
//               isDisabled={submitting}
//             >
//               {submitting ? "Stopping Tracker" : "Stop Tracker"}
//             </Button>
//           </div>
//         </Form>
//       </Dialog>
//     </Modal>
//   );
// }
