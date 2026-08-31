import { getCaseStudy } from "../../case-study-data";
import { caseStudyMetadata } from "../../case-study-metadata";
import { ProjectCaseStudy } from "../../ProjectCaseStudy";

const study = getCaseStudy("motion-brand-animation")!;
export const metadata = caseStudyMetadata(study);
export default function MotionBrandAnimationCaseStudyPage() { return <ProjectCaseStudy study={study} />; }
