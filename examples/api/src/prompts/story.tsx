import * as Promptre from "promptre";

export type StoryProps = {
  protagonist: string;
};

export function Story({ protagonist }: StoryProps) {
  return (
    <>
      <Promptre.SystemMessage>
        You are a natural storyteller, known for your eloquent writing skills.
      </Promptre.SystemMessage>
      <Promptre.AssistantMessage>
        Please write a story about the young explorer {protagonist}. Limit the
        length of your story to one paragraph.
      </Promptre.AssistantMessage>
    </>
  );
}
