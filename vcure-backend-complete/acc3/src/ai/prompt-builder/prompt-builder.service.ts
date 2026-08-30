import { Injectable } from '@nestjs/common';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { ChatMessage } from '../interfaces/ai-provider.interface';
import { AIError } from '../errors/ai.errors';

/**
 * PROMPT BUILDER — Service
 *
 * Single choke point where template + variables become the ChatMessage[]
 * sent to a provider. No other module is allowed to hand-assemble prompt
 * strings (CODE QUALITY: "Reusable Prompt Templates", Sec. Security:
 * "Never expose prompts").
 *
 * Input Schema:  { templateName: string, variables: Record<string, string> }
 * Output Schema: { messages: ChatMessage[], templateVersion: number, templateSource: 'DATABASE'|'BUNDLED_FALLBACK' }
 */
export interface BuildPromptInput {
  templateName: string;
  variables: Record<string, string>;
}

export interface BuildPromptOutput {
  messages: ChatMessage[];
  templateVersion: number;
  templateSource: 'DATABASE' | 'BUNDLED_FALLBACK';
  category: string;
}

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

@Injectable()
export class PromptBuilderService {
  constructor(private readonly templates: PromptTemplateService) {}

  async build(input: BuildPromptInput): Promise<BuildPromptOutput> {
    const template = await this.templates.getActiveTemplate(input.templateName);

    // Validation — every declared variable must be supplied. Missing
    // variables fail loudly instead of silently rendering "{{foo}}" into a
    // prompt that gets sent to a model.
    const missing = template.variables.filter((v) => !(v in input.variables));
    if (missing.length > 0) {
      throw new AIError(
        'PROMPT_VARIABLE_MISSING',
        `Prompt template "${input.templateName}" is missing required variables: ${missing.join(', ')}`,
      );
    }

    // Reject unexpected variables too — prevents silently-ignored typos in
    // calling code from masking a real integration bug.
    const unexpected = Object.keys(input.variables).filter((k) => !template.variables.includes(k));
    if (unexpected.length > 0) {
      throw new AIError(
        'PROMPT_VARIABLE_MISSING',
        `Prompt template "${input.templateName}" received unexpected variables: ${unexpected.join(', ')}`,
      );
    }

    const renderedUser = interpolate(template.userTemplate, input.variables);
    const messages: ChatMessage[] = [];
    if (template.system) messages.push({ role: 'system', content: template.system });
    messages.push({ role: 'user', content: renderedUser });

    return {
      messages,
      templateVersion: template.version,
      templateSource: template.source,
      category: template.category,
    };
  }
}

function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(VARIABLE_PATTERN, (_match, key: string) => {
    // Safe by construction: build() already verified every {{key}} present
    // in the template has a corresponding, validated variable.
    return variables[key];
  });
}
