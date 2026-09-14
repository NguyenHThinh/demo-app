import { redirect } from "next/navigation";

/** Open Existing now lives on /home — keep this route as a redirect. */
export default function ProjectsPage() {
  redirect("/home");
}
