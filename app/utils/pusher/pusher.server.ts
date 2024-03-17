import PusherServer from "pusher";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  host: process.env.PUSHER_HOST!,
  port: process.env.PUSHER_PORT!,
  useTLS: process.env.PUSHER_SCHEME === "https",
});
