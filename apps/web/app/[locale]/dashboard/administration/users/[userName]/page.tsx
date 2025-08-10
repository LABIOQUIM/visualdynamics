import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

import { UserFiles } from "./UserFiles";

import classes from "./page.module.css";

interface Props {
  params: Promise<{ userName: string }>;
}

export default async function Page({ params }: Props) {
  const userName = (await params).userName;

  return (
    <PageLayout className={classes.container}>
      <UserFiles userName={userName} />
    </PageLayout>
  );
}
