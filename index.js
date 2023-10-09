import credentials from "./firebase-admin-sdk-key.json" assert { type: "json" };
import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

admin.initializeApp({
    credential: admin.credential.cert(credentials),
  },
);

admin.firestore().collection("tasks").onSnapshot(async (snapshot) => {
  for (const change of snapshot.docChanges()) {
    const docData = change.doc.data();
    if (
      change.type === "modified" &&
      docData["changelog"][docData["changelog"].length - 1].change !== "update_todo_status"
    ) {
      const lastMessageSentToGroup = docData["last_message_sent_timestamp"] ?? 0;
      const modifiedDoc = change.doc.id;

      const notificationThreshold = 2 * 60000; // minutes * 60.000
      const currentTimestamp = Date.now();

      if (currentTimestamp >= lastMessageSentToGroup + notificationThreshold) {
        const message = {
          notification: {
            title: `'${docData["title"]}' changed!`,
            body: `There were new changes made to your list '${docData["title"]}'! ✨`,
          },
          data: {
            title: `'${docData["title"]}' changed!`,
            body: `There were new changes made to your list '${docData["title"]}'! ✨`,
            by: docData["changelog"][docData["changelog"].length - 1].by,
          },
          topic: modifiedDoc,
        };

        sendMessage(message);

        await change.doc.ref.update("last_message_sent_timestamp", Date.now());
      }
    }
  }
});

function sendMessage(message) {
  getMessaging().send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}
