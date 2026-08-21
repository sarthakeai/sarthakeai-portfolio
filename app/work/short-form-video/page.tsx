import { getCaseStudy } from "../../case-study-data";
import { caseStudyMetadata } from "../../case-study-metadata";
import { ProjectCaseStudy } from "../../ProjectCaseStudy";

const study = getCaseStudy("short-form-video")!;
export const metadata = caseStudyMetadata(study);
export default function ShortFormCaseStudyPage() { return <ProjectCaseStudy study={study} />; }
