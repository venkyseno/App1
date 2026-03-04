import { Card, PageContainer, PrimaryButton, TextAreaField } from "../components/ui";

export default function AskAI() {
  return (
    <PageContainer title="Ask AI" subtitle="Describe your issue and get quick suggestions.">
      <Card>
        <TextAreaField placeholder="Describe your issue..." rows={6} />
        <PrimaryButton className="mt-4 w-full">Analyze</PrimaryButton>
      </Card>
    </PageContainer>
  );
}
