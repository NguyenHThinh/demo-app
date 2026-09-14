import { redirect } from "next/navigation";

/** New Project form now lives on /home — keep this route as a redirect. */
export default function NewProjectPage() {
  redirect("/home");
}
