export function permissionToLevel (permission) {
  return ['', 'sub', 'mod', 'broadcaster', 'global_mod', 'admin', 'staff']
  .findIndex(p => p === permission);
}
