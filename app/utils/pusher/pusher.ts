import PusherClient from "pusher-js";

export const createPusherClient = (appKey: string, cluster: string) => {
  return new PusherClient(appKey, {
    wsHost: "127.0.0.1",
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    cluster,
    // channelAuthorization: {
    //   endpoint: "/api/pusher/auth",
    //   transport: "ajax",
    // },
    // cluster: cluster,
  });
};

// export const pusherClient = new PusherClient(process.env.PUSHER_APP_KEY!, {
//   channelAuthorization: {
//     endpoint: "/api/pusher/auth",
//     transport: "ajax",
//   },
//   cluster: process.env.PUSHER_APP_CLUSTER!,
// });
