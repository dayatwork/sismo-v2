import { Link } from "@remix-run/react";
import { Reply } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function InboxMailDetailIndex() {
  return (
    <div className="mt-4">
      <Button variant="outline" asChild>
        <Link to="reply">
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </Link>
      </Button>
    </div>
  );
}
