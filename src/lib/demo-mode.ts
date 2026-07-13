/** When true, skip Firebase Auth/Firestore and serve static dashboard data. */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
