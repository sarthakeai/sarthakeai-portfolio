import { getCaseStudy } from "../../case-study-data";
import { caseStudyMetadata } from "../../case-study-metadata";
import { ProjectCaseStudy } from "../../ProjectCaseStudy";

const study = getCaseStudy("21st-capital-introduction")!;
export const metadata = caseStudyMetadata(study);
export default function IntroductionCaseStudyPage() { return <ProjectCaseStudy study={study} />; }
