import { PageLayout } from "@/components/Layouts/PageLayout";
import { H2 } from "@/components/Typography";

const videos = [
  {
    title: "APO Simulation",
    url: "https://drive.google.com/file/d/1BbpmeqJXhPR9uqJOa_RXZy9j77-s0XA1/preview"
  },
  {
    title: "ACPYPE Simulation Preparation",
    url: "https://drive.google.com/file/d/1UoIQWeyCRnQDmQh7UKXpa5qgFBAEeja8/preview"
  },
  {
    title: "ACPYPE simulation",
    url: "https://drive.google.com/file/d/16CF3iHisYdq4aHA6RCAAsO0NFF_F6lpF/preview"
  },
  {
    title: "PRODRG Simulation Preparation",
    url: "https://drive.google.com/file/d/1xSsXTz-an7B7msRYFJnWp7-_yKUyCo47/preview"
  },
  {
    title: "PRODRG Simulation",
    url: "https://drive.google.com/file/d/1ktRiFo9BrjC8Tr8lcuFjHm_RzxMGSGIP/preview"
  },
  {
    title: "Download Simulation Generated Contents",
    url: "https://drive.google.com/file/d/1wwwKYAScCA6b6XbIkz84-XZEIiqK91XD/preview"
  }
];

export default function Page() {
  return (
    <PageLayout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {videos.map((v) => (
          <div
            className="space-y-2"
            key={v.title}
          >
            <H2>{v.title}</H2>
            <div className="aspect-video w-full">
              <iframe
                allow="autoplay"
                height="100%"
                width="100%"
                src={v.url}
              />
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
