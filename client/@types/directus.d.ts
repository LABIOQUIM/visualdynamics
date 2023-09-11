interface DocumentationType {
  id: string;
  title: string;
  status: "Published" | "Draft" | "Archived";
  content: string;
  date_created: string;
  date_updated: string;
  user_created?: {
    first_name: string;
  };
  user_updated?: {
    first_name: string;
  };
}

interface KnowledgeType {
  id: string;
  title: string;
  status: "Published" | "Draft" | "Archived";
  tags: ("Tutorial" | "Data" | "Maintenance" | "Release" | "News")[];
  content: string;
  date_created: string;
  date_updated: string;
  user_created?: {
    first_name: string;
  };
  user_updated?: {
    first_name: string;
  };
}
