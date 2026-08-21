import { getCaseStudy } from "../../case-study-data";
import { caseStudyMetadata } from "../../case-study-metadata";
import { ProjectCaseStudy } from "../../ProjectCaseStudy";

const study = getCaseStudy("21st-capital-interview")!;
export const metadata = caseStudyMetadata(study);
export default function InterviewCaseStudyPage() { return <ProjectCaseStudy study={study} />; }
