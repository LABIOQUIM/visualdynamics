/**
 * Renders a command template by replacing `{{variableName}}` placeholders
 * with the corresponding values from the provided variables map.
 *
 * Placeholders that do not match any key in `vars` are left unchanged,
 * preserving literal `{{...}}` syntax used by shell tools like sed.
 */
export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}
