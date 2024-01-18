import { ClassConstructor, plainToInstance } from 'class-transformer';

export async function makePostRequest<T, U>({
  endpoint,
  authToken,
  body,
  respClass,
}: {
  endpoint: string;
  authToken: string;
  body: T;
  respClass: ClassConstructor<U>;
}): Promise<U> {
  const res = await fetch(new URL(endpoint, getDeraApiUrl()).href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  const resJson = await res.json();

  return plainToInstance(respClass, resJson);
}

export async function makePutRequest<T, U>({
  endpoint,
  authToken,
  body,
  respClass,
}: {
  endpoint: string;
  authToken: string;
  body: T;
  respClass: ClassConstructor<U>;
}): Promise<U> {
  const res = await fetch(new URL(endpoint, getDeraApiUrl()).href, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  const resJson = await res.json();

  return plainToInstance(respClass, resJson);
}

export async function makeGetRequest<T>({
  endpoint,
  authToken,
  respClass,
}: {
  endpoint: string;
  authToken: string;
  respClass: ClassConstructor<T>;
}): Promise<T> {
  const res = await fetch(new URL(endpoint, getDeraApiUrl()).href, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  const resJson = await res.json();

  return plainToInstance(respClass, resJson);
}

export async function makeDeleteRequest<T>({
  endpoint,
  authToken,
  respClass,
}: {
  endpoint: string;
  authToken: string;
  respClass: ClassConstructor<T>;
}): Promise<T> {
  const res = await fetch(new URL(endpoint, getDeraApiUrl()).href, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    throw await constructError(res);
  }

  const resJson = await res.json();

  return plainToInstance(respClass, resJson);
}
export function getDeraApiUrl(): string {
  if (!process.env.NEXT_PUBLIC_DERA_BE_URL) {
    throw new Error('API URL not set');
  }

  return process.env.NEXT_PUBLIC_DERA_BE_URL;
}

async function constructError(res: Response): Promise<Error> {
  if (res.status >= 500) {
    return new Error('An internal server error occurred. Please try again.');
  } else {
    const resJson = await res.json();
    return new Error(
      `A client error (status=${res.status}) occurred. ${
        resJson?.message || 'No error message provided.'
      }`,
    );
  }
}
