import { Suspense } from "react";
import InviteComponent from "../components/InviteComponent";

export default function InvitePage() {
  return (
    <Suspense>
      <InviteComponent />
    </Suspense>
  );
}
