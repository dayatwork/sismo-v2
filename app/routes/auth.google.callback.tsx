// import { type LoaderFunctionArgs } from "@remix-run/node";
// import { AuthorizationError } from "remix-auth";

// import { authenticator } from "~/services/auth.server";
// import { redirectWithToast } from "~/utils/toast.server";

// export async function loader({ request }: LoaderFunctionArgs) {
//   try {
//     const data = await authenticator.authenticate("google", request, {
//       successRedirect: "/app",
//       throwOnError: true,
//     });
//     return data;
//   } catch (error) {
//     let description = "Something went wrong";
//     if (error instanceof AuthorizationError) {
//       description = error.message;
//       return redirectWithToast("/login", {
//         description,
//         type: "error",
//       });
//     }
//     return null;
//   }
// }

import { type LoaderFunctionArgs } from "@remix-run/node";
import { AuthorizationError } from "remix-auth";

import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await authenticator.authenticate("google", request, {
      throwOnError: true,
    });

    const session = await getSession(request.headers.get("cookie"));
    session.set(authenticator.sessionKey, user);

    const headers = new Headers({ "set-cookie": await commitSession(session) });

    return redirectWithToast(
      "/app",
      { description: "Login success", type: "success" },
      { headers }
    );
  } catch (error) {
    let description = "Login failed";
    if (error instanceof AuthorizationError) {
      description = error.message;
    }
    return redirectWithToast("/login", { description, type: "error" });
  }
}
