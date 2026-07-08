import { getName } from './package-info.js';

export default async function(version) {
  if (!version) {
    return null;
  }

  const name = await getName();
  return `${name}@${version}`;
}
