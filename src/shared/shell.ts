import which from 'which'

export function cmdExists(cmd: string) {
  return which.sync(cmd, { nothrow: true }) !== null
}
