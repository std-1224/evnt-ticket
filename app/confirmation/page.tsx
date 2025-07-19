import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Ticket } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="mx-auto bg-lime-400/20 text-lime-400 rounded-full p-3 w-fit">
            <CheckCircle className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl mt-4">Your ticket is confirmed!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            You're all set for SYNTHWAVE 2025. We've sent a confirmation to your email.
          </p>
          <Link href="/tickets">
            <Button size="lg" className="w-full bg-lime-400 text-black hover:bg-lime-500">
              <Ticket className="mr-2 h-5 w-5" />
              View My Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
