type FormSubmissionStatus =
  | { status: "loading" }
  | {
      status: "info" | "error" | "warning" | "success";
      message?: string;
      title: string;
    };
