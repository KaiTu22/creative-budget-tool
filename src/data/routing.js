// ─────────────────────────────────────────────
// HASH-BASED ROUTING UTILITIES
// ─────────────────────────────────────────────

export function getHash() {
  return window.location.hash.slice(1) || '/'
}

export function setHash(path) {
  window.location.hash = path
}

export function parseHash() {
  const hash = getHash()
  const parts = hash.split('/').filter(Boolean)

  // /#/project/:projectId
  if (parts[0] === 'project' && parts[1] && !parts[2]) {
    return { type: 'project', projectId: parts[1] }
  }

  // /#/project/:projectId/version/:versionId
  if (parts[0] === 'project' && parts[1] && parts[2] === 'version' && parts[3]) {
    return { type: 'version', projectId: parts[1], versionId: parts[3] }
  }

  return { type: 'home' }
}