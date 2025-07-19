import { redirect } from 'next/navigation'

export default function EventPage() {
  // Redirect to events list page
  redirect('/events')
}
