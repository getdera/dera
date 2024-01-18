export const projectDetailsValidation = {
  name: (value: string) =>
    value.trim().length === 0 ? 'Project name is required' : null,
  description: (value: string) => null,
};
