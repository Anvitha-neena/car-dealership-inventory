export type Environment = {
  mongoUri: string;
  jwtSecret: string;
  port: number;
};

type EnvironmentVariables = Record<string, string | undefined>;

function requiredValue(name: string, variables: EnvironmentVariables): string {
  const value = variables[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be set.`);
  }

  return value;
}

export function readEnvironment(variables: EnvironmentVariables): Environment {
  const portValue = variables.PORT?.trim() ?? '3000';
  const port = Number(portValue);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be a number between 1 and 65535.');
  }

  return {
    mongoUri: requiredValue('MONGODB_URI', variables),
    jwtSecret: requiredValue('JWT_SECRET', variables),
    port
  };
}
