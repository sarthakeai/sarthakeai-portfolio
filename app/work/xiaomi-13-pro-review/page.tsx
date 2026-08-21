import { getCaseStudy } from "../../case-study-data";
import { caseStudyMetadata } from "../../case-study-metadata";
import { ProjectCaseStudy } from "../../ProjectCaseStudy";

const study = getCaseStudy("xiaomi-13-pro-review")!;
export const metadata = caseStudyMetadata(study);
export default function XiaomiCaseStudyPage() { return <ProjectCaseStudy study={study} />; }
