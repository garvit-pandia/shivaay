import { PageHero } from "@/components/motion/PageHero";

interface ResourcesHeaderProps {
  title: string;
  description: string;
  /** Giant outlined word drifting behind the header. */
  ghost?: string;
}

export function ResourcesHeader({ title, description, ghost = "Resources" }: ResourcesHeaderProps) {
  return <PageHero kicker="Resources" title={title} description={description} ghost={ghost} />;
}
