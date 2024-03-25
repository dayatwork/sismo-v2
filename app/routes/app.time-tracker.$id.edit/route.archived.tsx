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
// import { conform, useForm } from "@conform-to/react";
// import {
//   parseAbsoluteToLocal,
//   parseZonedDateTime,
// } from "@internationalized/date";

// import { cn } from "~/lib/utils";
// import { buttonVariants } from "~/components/ui/button";
// import { Progress } from "~/components/ui/progress";
// import { useState } from "react";
// import { Label } from "~/components/ui/label";
// import { Textarea } from "~/components/ui/textarea";
// import { requireOrganizationUser } from "~/utils/auth.server";
// import {
//   editTimeTracker,
//   getPreviousTaskTracker,
//   getUserTimeTrackerById,
// } from "~/services/time-tracker.server";
// import { RADatePicker } from "~/components/ui/react-aria/datepicker";
// import { Separator } from "~/components/ui/separator";
// import { emitter } from "~/utils/sse/emitter.server";

// const schema = z.object({
//   taskCompletion: z.number().min(0).max(100),
//   note: z.string().optional(),
//   startAt: z.any(),
//   endAt: z.any(),
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
//     return json({ submission, errorTime: null });
//   }

//   const { taskCompletion, note, startAt, endAt } = submission.value;

//   const formattedStartAt =
//     parseZonedDateTime(startAt).toAbsoluteString() || undefined;
//   const formattedEndAt =
//     parseZonedDateTime(endAt).toAbsoluteString() || undefined;

//   if (formattedStartAt && formattedEndAt) {
//     if (
//       new Date(formattedStartAt).getTime() > new Date(formattedEndAt).getTime()
//     ) {
//       return json({
//         submission,
//         errorTime: "End time should greater than start time",
//       });
//     }
//   }

//   await editTimeTracker({
//     taskCompletion,
//     trackerId,
//     note,
//     startAt: formattedStartAt,
//     endAt: formattedEndAt,
//     organizationId,
//     userId: loggedInUser.id,
//   });

//   emitter.emit(`tracker-${loggedInUser.id}-changed`);

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

//   const loggedInUser = await requireOrganizationUser(request, organizationId);

//   if (!loggedInUser) {
//     return redirect("/app");
//   }

//   const tracker = await getUserTimeTrackerById({
//     trackerId,
//     userId: loggedInUser.id,
//   });

//   if (!tracker) {
//     return redirect(`/app/${organizationId}/time-tracker`);
//   }

//   const previousTaskTracker = await getPreviousTaskTracker({
//     currentTrackerCompletion: tracker.taskCompletion,
//     currentTrackerId: tracker.id,
//     taskId: tracker.taskId,
//   });

//   return json({ tracker, previousTaskTracker });
// }

// export default function EditTimeTracker() {
//   const actionData = useActionData<typeof action>();
//   const { tracker, previousTaskTracker } = useLoaderData<typeof loader>();
//   const navigate = useNavigate();
//   const { orgId } = useParams<{ orgId: string }>();
//   const [progress, setProgress] = useState(tracker.taskCompletion || 0);
//   const navigation = useNavigation();
//   const submitting = navigation.state === "submitting";

//   const [form, { endAt, note, startAt, taskCompletion }] = useForm({
//     lastSubmission: actionData?.submission,
//     shouldValidate: "onSubmit",
//     onValidate: ({ formData }) => {
//       return parse(formData, { schema });
//     },
//     defaultValue: {
//       startAt: tracker.startAt,
//       endAt: tracker.endAt,
//       note: tracker.note,
//     },
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
//           <h1 className="text-lg font-semibold">Edit Tracker</h1>
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
//               onPress={() =>
//                 setProgress(previousTaskTracker?.taskCompletion || 0)
//               }
//               className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
//             >
//               Reset
//             </Button>
//             <Button
//               onPress={() =>
//                 setProgress((prev) => (prev - 10 > 0 ? prev - 10 : 0))
//               }
//               className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
//               isDisabled={progress <= 0}
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
//           {/* <input type="hidden" name="taskCompletion" value={progress} /> */}
//           <input
//             type="hidden"
//             value={progress}
//             {...conform.input(taskCompletion)}
//           />
//           <div className="mt-4 grid gap-2">
//             <div className="flex justify-between items-center">
//               <Label htmlFor="note">Note</Label>
//               <span className="text-sm text-muted-foreground leading-none">
//                 optional
//               </span>
//             </div>
//             <Textarea
//               id="note"
//               defaultValue={note.defaultValue}
//               {...conform.input(note)}
//             />
//             <p className="-mt-1.5 text-sm text-red-600 font-semibold">
//               {note.error}
//             </p>
//           </div>
//           <Separator className="my-4" />
//           <div className="space-y-4">
//             <RADatePicker
//               label="Start at"
//               name="startAt"
//               granularity="second"
//               hourCycle={24}
//               defaultValue={
//                 startAt.defaultValue
//                   ? parseAbsoluteToLocal(startAt.defaultValue)
//                   : undefined
//               }
//             />
//             <p className="-mt-1.5 text-sm text-red-600 font-semibold">
//               {startAt.error}
//             </p>
//             <RADatePicker
//               label="End at"
//               name="endAt"
//               granularity="second"
//               hourCycle={24}
//               defaultValue={
//                 endAt.defaultValue
//                   ? parseAbsoluteToLocal(endAt.defaultValue)
//                   : undefined
//               }
//             />
//             <p className="-mt-1.5 text-sm text-red-600 font-semibold">
//               {endAt.errors || actionData?.errorTime}
//             </p>
//           </div>
//           <div className="mt-8 flex justify-end gap-2 w-full">
//             <Button
//               type="button"
//               className={cn(buttonVariants({ variant: "ghost" }))}
//               onPress={() => navigate(`/app/${orgId}time-tracker`)}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               className={cn(buttonVariants())}
//               isDisabled={submitting}
//             >
//               {submitting ? "Saving" : "Save"}
//             </Button>
//           </div>
//         </Form>
//       </Dialog>
//     </Modal>
//   );
// }
