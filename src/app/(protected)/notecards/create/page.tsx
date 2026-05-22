import { redirect } from "next/navigation";

export default function NotecardCreatePage() {
  redirect("/upload?generate=notecards");
}
